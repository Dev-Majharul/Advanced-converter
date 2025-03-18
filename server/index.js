const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const socketIo = require('socket.io');
const http = require('http');

ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Allow for flexible port assignment based on hosting environment
// For example, Heroku, DigitalOcean App Platform, or other PaaS providers
const PORT = process.env.PORT || process.env.SERVER_PORT || 5001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow inline scripts, enable in production with proper CSP
  crossOriginEmbedderPolicy: false, // Allow embedded content
}));
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp'),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit (increased from 100MB)
  abortOnLimit: true,
  debug: process.env.NODE_ENV === 'development',
}));

// Serve documentation files
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.use('/docs', express.static(path.join(__dirname, '../client/public/docs')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app
const clientBuildPath = path.join(__dirname, '../client/build');
const setupGuidePath = path.join(__dirname, '../setup-guide.html');

// Check if client build exists, otherwise serve the setup guide
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  
  // For any request that doesn't match an API route, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // If the client build doesn't exist, serve the setup guide
  app.get('/', (req, res) => {
    res.sendFile(setupGuidePath);
  });
  
  // Still serve API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      // Let API routes be handled by their handlers
      return;
    }
    
    // Show setup guide for all other routes
    res.sendFile(setupGuidePath);
  });
  
  console.log('\x1b[33m%s\x1b[0m', 'WARNING: Client build not found. Serving setup guide instead.');
  console.log('\x1b[33m%s\x1b[0m', 'To set up the application, follow the instructions in the setup guide.');
}

// Create necessary directories if they don't exist
const dirs = ['uploads', 'temp', 'cache'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Socket.io for real-time progress updates
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Keep track of active conversion jobs
const conversionJobs = new Map();

// Helper function to clean up temporary files
const cleanupFiles = (files) => {
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (err) {
      console.error(`Error cleaning up file ${file}:`, err);
    }
  });
};

// API routes
app.post('/api/convert/image', async (req, res) => {
  try {
    console.log("Image conversion request received");
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    // Handle both single file and multiple files
    const files = req.files.file ? 
      (Array.isArray(req.files.file) ? req.files.file : [req.files.file]) : 
      [];
    
    if (files.length === 0) {
      return res.status(400).json({ error: 'No valid files found in the request' });
    }
    
    console.log(`Processing ${files.length} files for conversion`);
    
    const format = req.body.format || 'jpeg';
    const quality = parseInt(req.body.quality) || 80;
    
    // Validate format
    const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'bmp'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: 'Invalid format specified' });
    }
    
    // For multiple files, we'll return multiple job IDs
    const jobIds = [];
    
    // Process each file - with more efficient handling
    // NOTE: There is NO explicit limit on the number of files that can be processed
    // If you're experiencing limits, it's likely due to system resources or network constraints
    for (const file of files) {
      try {
    const jobId = uuidv4();
    const outputFilename = `${path.parse(file.name).name}.${format}`;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);
    
    // Track this job
    conversionJobs.set(jobId, {
      type: 'image',
      status: 'processing',
      progress: 0,
      file: file.name,
      output: outputPath
    });
    
        jobIds.push(jobId);
        
        // Start conversion in a more efficient way - without using a nested async IIFE
        // This improves performance and error handling
        processImage(jobId, file, format, quality, outputPath, req.body);
      } catch (fileError) {
        console.error(`Error setting up conversion for ${file.name}:`, fileError);
        // Continue with other files if one fails
      }
    }
    
    // Send job IDs back to client
    if (jobIds.length === 1) {
    res.status(202).json({ 
        jobId: jobIds[0], 
      message: 'Conversion started',
        estimatedTime: '2 seconds' // More optimistic timing
      });
    } else {
      res.status(202).json({ 
        jobIds, 
        message: `Processing ${jobIds.length} files`,
        estimatedTime: `${Math.ceil(jobIds.length * 1.5)} seconds` // More optimistic timing
      });
    }
    
  } catch (error) {
    console.error("Image conversion error:", error);
    return res.status(500).json({ error: 'Image conversion failed', details: error.message });
  }
});

// Helper function to process an image - extracted for cleaner code and better performance
async function processImage(jobId, file, format, quality, outputPath, options) {
  try {
    console.log(`Starting conversion for file: ${file.name}, format: ${format}`);
    
    // Check if the file exists and is accessible
    if (!fs.existsSync(file.tempFilePath)) {
      throw new Error(`Temp file not found: ${file.tempFilePath}`);
    }
    
    // Try to load the file directly first to validate it
    try {
      const fileBuffer = fs.readFileSync(file.tempFilePath);
      console.log(`Successfully read file: ${file.name}, size: ${fileBuffer.length} bytes`);
    } catch (readError) {
      console.error(`Failed to read file ${file.name}:`, readError);
      throw new Error(`File read error: ${readError.message}`);
    }
    
    // Create sharp instance with better settings for compatibility
    let image = sharp(file.tempFilePath, { 
      failOnError: false, // More forgiving of slightly corrupt images
      limitInputPixels: 268402689, // Higher pixel limit (16384×16384)
      density: 300, // Higher density for better quality
      pages: 1, // Only process first page of multi-page files
    });
    
    console.log(`Sharp instance created for: ${file.name}`);
    
    // Instead of building a complex pipeline, use a simpler approach
    // Apply resize if needed
    if (options.width && options.height) {
      const width = parseInt(options.width) || null;
      const height = parseInt(options.height) || null;
      
      if (width > 0 || height > 0) {
        console.log(`Resizing to: ${width}x${height}`);
        image = image.resize(width, height, { 
          fit: options.maintainAspectRatio === 'true' ? 'inside' : 'fill' 
        });
      }
      
      // Update progress
      conversionJobs.get(jobId).progress = 30;
      io.emit('conversionProgress', { 
        jobId, 
        progress: 30,
        status: 'Resizing image'
      });
    }
    
    // Apply grayscale if needed
    if (options.grayscale === 'true') {
      console.log('Applying grayscale');
      image = image.grayscale();
      
      // Update progress
      conversionJobs.get(jobId).progress = 40;
      io.emit('conversionProgress', { 
        jobId, 
        progress: 40,
        status: 'Applying grayscale'
      });
    }
    
    // Apply rotation if needed
    if (options.rotate) {
      const angle = parseInt(options.rotate) || 0;
      if (angle !== 0) {
        console.log(`Rotating by ${angle} degrees`);
        image = image.rotate(angle);
      }
    }
    
    // Apply blur if needed
    if (options.blur) {
      const blurAmount = parseFloat(options.blur) || 0;
      if (blurAmount > 0) {
        console.log(`Applying blur: ${blurAmount}`);
        image = image.blur(blurAmount);
      }
    }
    
    // Apply sharpen if needed
    if (options.sharpen === 'true') {
      console.log('Applying sharpening');
      image = image.sharpen();
    }
    
    // Update progress
    conversionJobs.get(jobId).progress = 70;
    io.emit('conversionProgress', { 
      jobId, 
      progress: 70,
      status: 'Processing image format'
    });
    
    // Handle format-specific options
    const formatOptions = { quality };
    
    if (format === 'jpeg' || format === 'jpg') {
      formatOptions.mozjpeg = true;
    } else if (format === 'png') {
      formatOptions.compressionLevel = 6;
    } else if (format === 'webp') {
      formatOptions.lossless = false;
      formatOptions.reductionEffort = 4;
    }
    
    console.log(`Converting to ${format} with options:`, formatOptions);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    try {
      // Convert the image with proper error handling
      await image.toFormat(format, formatOptions).toFile(outputPath);
      console.log(`Conversion successful: ${outputPath}`);
      
      // Verify the output file exists and has content
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error('Output file is empty or does not exist');
      }
    
    // Update job status
    conversionJobs.get(jobId).status = 'completed';
    conversionJobs.get(jobId).progress = 100;
    
    // Emit completion event
    io.emit('conversionComplete', { 
      jobId, 
      downloadUrl: `/api/download/${jobId}`,
      message: 'Image conversion complete'
    });
    
    // Create a cache entry for quick retrieval
    const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
    fs.copyFileSync(outputPath, path.join(cacheDir, jobId));
    
    // Clean up temp file
    cleanupFiles([file.tempFilePath]);
    
    // Job will remain available for download for 1 hour
    setTimeout(() => {
      cleanupFiles([outputPath, path.join(cacheDir, jobId)]);
      conversionJobs.delete(jobId);
    }, 60 * 60 * 1000);
    } catch (conversionError) {
      console.error(`Sharp conversion error for ${file.name}:`, conversionError);
      throw new Error(`Conversion failed: ${conversionError.message}`);
    }
  } catch (error) {
    console.error(`Error converting file ${file.name}:`, error);
    // Update job status to error
    if (conversionJobs.has(jobId)) {
      conversionJobs.get(jobId).status = 'error';
      conversionJobs.get(jobId).error = error.message;
    }
    
    // Emit error event
    io.emit('conversionError', { 
      jobId, 
      error: error.message 
    });
    
    // Clean up temp file
    try {
      if (fs.existsSync(file.tempFilePath)) {
        cleanupFiles([file.tempFilePath]);
      }
    } catch (cleanupError) {
      console.error(`Error cleaning up temp file:`, cleanupError);
    }
  }
}

app.post('/api/convert/video', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const file = req.files.file;
    const format = req.body.format || 'mp4';
    
    // Validate format
    const validFormats = ['mp4', 'webm', 'avi', 'mov', 'gif'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: 'Invalid format specified' });
    }
    
    const jobId = uuidv4();
    const outputFilename = `${path.parse(file.name).name}.${format}`;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);
    
    // Track this job
    conversionJobs.set(jobId, {
      type: 'video',
      status: 'processing',
      progress: 0,
      file: file.name,
      output: outputPath
    });
    
    // Send job ID back to client
    res.status(202).json({ 
      jobId, 
      message: 'Conversion started',
      estimatedTime: format === 'gif' ? '60 seconds' : '30 seconds'
    });
    
    // Configure ffmpeg
    let command = ffmpeg(file.tempFilePath);
    
    // Resolution handling
    if (req.body.resolution && req.body.resolution !== 'original') {
      const resolutions = {
        '1080p': { width: 1920, height: 1080 },
        '720p': { width: 1280, height: 720 },
        '480p': { width: 854, height: 480 },
        '360p': { width: 640, height: 360 }
      };
      
      const resolution = resolutions[req.body.resolution];
      if (resolution) {
        command = command.size(`${resolution.width}x${resolution.height}`);
      }
    }
    
    // Extract audio if requested
    if (req.body.extractAudio === 'true') {
      const audioPath = path.join(__dirname, 'uploads', `${path.parse(file.name).name}.mp3`);
      ffmpeg(file.tempFilePath)
        .noVideo()
        .format('mp3')
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent) || 0;
          io.emit('conversionProgress', { 
            jobId: `${jobId}-audio`, 
            progress: percent,
            status: 'Extracting audio'
          });
        })
        .on('end', () => {
          io.emit('conversionComplete', { 
            jobId: `${jobId}-audio`, 
            downloadUrl: `/api/download/${jobId}-audio`,
            message: 'Audio extraction complete'
          });
          
          // Create cache entry for audio
          const cacheDir = path.join(__dirname, 'cache');
          fs.copyFileSync(audioPath, path.join(cacheDir, `${jobId}-audio`));
          
          // Audio file will be available for 1 hour
          setTimeout(() => {
            cleanupFiles([audioPath, path.join(cacheDir, `${jobId}-audio`)]);
          }, 60 * 60 * 1000);
        })
        .save(audioPath);
    }
    
    // Handle trimming if requested
    if (req.body.trim === 'true') {
      if (req.body.startTime) {
        command = command.setStartTime(req.body.startTime);
      }
      
      if (req.body.endTime) {
        command = command.setDuration(req.body.endTime);
      }
    }
    
    // Set video bitrate for quality control
    command = command.videoBitrate(req.body.bitrate || '1000k');
    
    // Format-specific options
    if (format === 'gif') {
      command = command.fps(10);
    }
    
    // Process the video
    command
      .format(format)
      .on('progress', (progress) => {
        const percent = Math.round(progress.percent) || 0;
        conversionJobs.get(jobId).progress = percent;
        io.emit('conversionProgress', { 
          jobId, 
          progress: percent,
          status: `Converting video: ${percent}% complete`,
          timeLeft: progress.timemark
        });
      })
      .on('end', () => {
        // Update job status
        conversionJobs.get(jobId).status = 'completed';
        conversionJobs.get(jobId).progress = 100;
        
        // Emit completion event
        io.emit('conversionComplete', { 
          jobId, 
          downloadUrl: `/api/download/${jobId}`,
          message: 'Video conversion complete'
        });
        
        // Create a cache entry for quick retrieval
        const cacheDir = path.join(__dirname, 'cache');
        fs.copyFileSync(outputPath, path.join(cacheDir, jobId));
        
        // Clean up temp file
        cleanupFiles([file.tempFilePath]);
        
        // Job will remain available for download for 1 hour
        setTimeout(() => {
          cleanupFiles([outputPath, path.join(cacheDir, jobId)]);
          conversionJobs.delete(jobId);
        }, 60 * 60 * 1000);
      })
      .on('error', (err) => {
        console.error(err);
        conversionJobs.get(jobId).status = 'error';
        conversionJobs.get(jobId).error = err.message;
        io.emit('conversionError', { 
          jobId, 
          error: err.message
        });
        
        // Clean up temp file
        cleanupFiles([file.tempFilePath]);
      })
      .save(outputPath);
      
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Video conversion failed', details: error.message });
  }
});

app.post('/api/convert/pdf/prepare-editor', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const file = req.files.file;
    const jobId = uuidv4();
    const outputPath = path.join(__dirname, 'uploads', `${jobId}_${file.name}`);
    
    // Move the uploaded file to the uploads directory
    await file.mv(outputPath);
    
    // Create an entry for this job
    conversionJobs.set(jobId, {
      type: 'pdf_edit',
      status: 'editing',
      originalFile: file.name,
      outputPath,
      created: new Date()
    });
    
    // Return URL for the editor to access this file
    const editorUrl = `/api/pdf-editor/${jobId}`;
    
    res.status(200).json({
      jobId,
      editorUrl,
      message: 'PDF ready for editing'
    });
    
  } catch (error) {
    console.error('Error preparing PDF for editing:', error);
    return res.status(500).json({ error: 'Failed to prepare PDF for editing', details: error.message });
  }
});

// Endpoint to serve PDF for editing
app.get('/api/pdf-editor/:jobId', (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = conversionJobs.get(jobId);
    
    if (!job || job.type !== 'pdf_edit') {
      return res.status(404).json({ error: 'PDF job not found' });
    }
    
    // Serve the PDF editor page
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
    
  } catch (error) {
    console.error('Error serving PDF editor:', error);
    return res.status(500).json({ error: 'Error serving PDF editor', details: error.message });
  }
});

// Endpoint to get PDF content for editing
app.get('/api/pdf-content/:jobId', (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = conversionJobs.get(jobId);
    
    if (!job || job.type !== 'pdf_edit') {
      return res.status(404).json({ error: 'PDF job not found' });
    }
    
    // Serve the PDF file
    res.sendFile(job.outputPath);
    
  } catch (error) {
    console.error('Error serving PDF content:', error);
    return res.status(500).json({ error: 'Error serving PDF content', details: error.message });
  }
});

// Endpoint to save edited PDF
app.post('/api/pdf-editor/save/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = conversionJobs.get(jobId);
    
    if (!job || job.type !== 'pdf_edit') {
      return res.status(404).json({ error: 'PDF job not found' });
    }
    
    // Get the annotations and edit operations from the request
    const { annotations, operations } = req.body;
    
    if (!annotations && !operations) {
      return res.status(400).json({ error: 'No edit operations provided' });
    }
    
    // Load the PDF document
    const pdfBytes = fs.readFileSync(job.outputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Here we would implement the actual PDF editing based on annotations and operations
    // This would require more complex code with pdf-lib to manipulate the PDF
    
    // For this demonstration, we'll just modify the PDF metadata
    pdfDoc.setTitle(`Edited: ${job.originalFile}`);
    pdfDoc.setModificationDate(new Date());
    
    // Save the edited PDF
    const editedPdfBytes = await pdfDoc.save();
    const editedPath = path.join(__dirname, 'uploads', `edited_${path.basename(job.originalFile)}`);
    fs.writeFileSync(editedPath, editedPdfBytes);
    
    // Update job status
    job.status = 'completed';
    job.editedPath = editedPath;
    
    res.status(200).json({
      success: true,
      jobId,
      downloadUrl: `/api/download/${jobId}`,
      message: 'PDF edited successfully'
    });
    
  } catch (error) {
    console.error('Error saving edited PDF:', error);
    return res.status(500).json({ error: 'Failed to save edited PDF', details: error.message });
  }
});

// Update the PDF conversion endpoint to support editing
app.post('/api/convert/pdf', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    const operation = req.body.operation;
    if (!['compress', 'merge', 'split', 'convert', 'edit'].includes(operation)) {
      return res.status(400).json({ error: 'Invalid PDF operation' });
    }
    
    const jobId = uuidv4();
    let outputPath;
    let files = [];
    
    // Track this job
    conversionJobs.set(jobId, {
      type: 'pdf',
      operation,
      status: 'processing',
      progress: 0
    });
    
    // Send job ID back to client
    res.status(202).json({ 
      jobId, 
      message: 'PDF operation started',
      estimatedTime: operation === 'merge' ? '30 seconds' : '15 seconds'
    });
    
    // Implement PDF operations here based on operation type
    switch (operation) {
      case 'compress':
        const file = req.files.file;
        files.push(file.tempFilePath);
        outputPath = path.join(__dirname, 'uploads', `compressed_${path.basename(file.name)}`);
        
        // Mock compression
        setTimeout(() => {
          fs.copyFileSync(file.tempFilePath, outputPath);
          
          // Update job status
          conversionJobs.get(jobId).status = 'completed';
          conversionJobs.get(jobId).progress = 100;
          conversionJobs.get(jobId).output = outputPath;
          
          // Emit completion event
          io.emit('conversionComplete', { 
            jobId, 
            downloadUrl: `/api/download/${jobId}`,
            message: 'PDF compression complete'
          });
          
          // Create cache entry
          const cacheDir = path.join(__dirname, 'cache');
          fs.copyFileSync(outputPath, path.join(cacheDir, jobId));
          
          // Clean up temp files
          cleanupFiles(files);
        }, 3000);
        break;
        
      case 'merge':
        // Logic for merging PDFs
        // ...
        break;
        
      case 'split':
        // Logic for splitting PDFs
        // ...
        break;
        
      case 'convert':
        // Logic for converting PDFs
        // ...
        break;
        
      case 'edit':
        // Handle PDF editing via prepare-editor endpoint
        // This would typically just redirect to the editor UI
        const editFile = req.files.file;
        files.push(editFile.tempFilePath);
        outputPath = path.join(__dirname, 'uploads', `editing_${path.basename(editFile.name)}`);
        
        // Move the file
        await editFile.mv(outputPath);
        
        // Update job status
        conversionJobs.get(jobId).status = 'editing';
        conversionJobs.get(jobId).progress = 100;
        conversionJobs.get(jobId).output = outputPath;
        conversionJobs.get(jobId).originalFile = editFile.name;
        
        // Emit event for client
        io.emit('conversionComplete', { 
          jobId, 
          editorUrl: `/api/pdf-editor/${jobId}`,
          message: 'PDF ready for editing'
        });
        
        // Create cache entry
        const cacheDir = path.join(__dirname, 'cache');
        fs.copyFileSync(outputPath, path.join(cacheDir, jobId));
        
        // Clean up temp files
        cleanupFiles(files);
        break;
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'PDF operation failed', details: error.message });
  }
});

// Download endpoint for completed conversions
app.get('/api/download/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  console.log(`Download request for job ${jobId}`);
  
  const job = conversionJobs.get(jobId);
  
  if (!job) {
    console.error(`Job ${jobId} not found`);
    return res.status(404).json({ error: 'Job not found' });
  }
  
  if (job.status !== 'completed') {
    console.error(`Job ${jobId} not completed (status: ${job.status})`);
    return res.status(400).json({ error: 'Job not completed yet' });
  }
  
  // Check if output file exists
  if (!fs.existsSync(job.output)) {
    console.error(`Output file not found for job ${jobId}: ${job.output}`);
    return res.status(404).json({ error: 'Output file not found' });
  }
  
  // Log file information
  const stats = fs.statSync(job.output);
  console.log(`Sending file ${job.output} (${stats.size} bytes)`);
  
  // Send the file with proper headers
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(job.output)}"`);
  res.setHeader('Content-Length', stats.size);
  
  // Set content type based on file extension
  const ext = path.extname(job.output).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff'
  };
  
  if (contentTypes[ext]) {
    res.setHeader('Content-Type', contentTypes[ext]);
  }
  
  // Stream the file instead of using res.download
  const fileStream = fs.createReadStream(job.output);
  fileStream.pipe(res);
  
  fileStream.on('error', (err) => {
    console.error(`Error streaming file for job ${jobId}:`, err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Download failed', details: err.message });
    }
  });
});

// Job status endpoint
app.get('/api/status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = conversionJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json({ 
    id: jobId,
    type: job.type,
    status: job.status,
    progress: job.progress,
    file: job.file
  });
});

// Web view endpoint for previewing files
app.get('/api/preview/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = conversionJobs.get(jobId);
  
  if (!job || job.status !== 'completed') {
    return res.status(404).json({ error: 'Job not found or not completed' });
  }
  
  // Different handling based on file type
  const fileExt = path.extname(job.output).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
    // For images, serve the file directly
    res.sendFile(job.output);
  } else if (['.mp4', '.webm'].includes(fileExt)) {
    // For videos, serve with proper content type
    const contentTypes = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm'
    };
    res.setHeader('Content-Type', contentTypes[fileExt]);
    fs.createReadStream(job.output).pipe(res);
  } else if (fileExt === '.pdf') {
    // For PDFs, serve with proper content type
    res.setHeader('Content-Type', 'application/pdf');
    fs.createReadStream(job.output).pipe(res);
  } else {
    // For other files, just download
    res.download(job.output);
  }
});

// Batch conversion endpoint
app.post('/api/batch/convert', (req, res) => {
  // Logic for batch conversion
  res.status(501).json({ message: 'Batch conversion not fully implemented yet' });
});

// Batch download endpoint - downloads multiple files as a ZIP
app.get('/api/download/batch', async (req, res) => {
  try {
    const jobIds = req.query.jobs ? req.query.jobs.split(',') : [];
    
    console.log(`Batch download request for jobs: ${jobIds.join(', ')}`);
    
    if (!jobIds.length) {
      return res.status(400).json({ error: 'No job IDs provided' });
    }
    
    // Create a unique name for this batch download
    const batchId = uuidv4();
    const zipFilename = `batch-${batchId}.zip`;
    const zipPath = path.join(__dirname, 'temp', zipFilename);
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.dirname(zipPath))) {
      fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    }
    
    console.log(`Creating batch ZIP at: ${zipPath}`);
    
    // Collect all valid jobs
    const validJobs = [];
    const invalidJobs = [];
    
    for (const jobId of jobIds) {
      const job = conversionJobs.get(jobId);
      if (job && job.status === 'completed' && fs.existsSync(job.output)) {
        validJobs.push(job);
      } else {
        let reason = '';
        if (!job) reason = 'job not found';
        else if (job.status !== 'completed') reason = `status is ${job.status}`;
        else if (!fs.existsSync(job.output)) reason = 'output file missing';
        
        invalidJobs.push({ jobId, reason });
      }
    }
    
    console.log(`Found ${validJobs.length} valid jobs and ${invalidJobs.length} invalid jobs`);
    
    if (invalidJobs.length > 0) {
      console.warn(`Invalid jobs in batch request:`, invalidJobs);
    }
    
    if (!validJobs.length) {
      return res.status(404).json({ 
        error: 'No valid completed jobs found',
        details: {
          invalidJobs,
          jobIds
        }
      });
    }
    
    // Load archiver dynamically
    const archiver = require('archiver');
    
    // Create a ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 3 } // Lower compression level for speed (1-9)
    });
    
    const output = fs.createWriteStream(zipPath);
    
    // Set up archive event handlers
    archive.on('warning', (err) => {
      console.warn(`Warning creating ZIP archive:`, err);
    });
    
    archive.on('error', (err) => {
      console.error(`Error creating ZIP archive:`, err);
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Failed to create ZIP archive', details: err.message });
      }
    });
    
    // When the archive is finalized and output is closed, send the ZIP file
    output.on('close', () => {
      console.log(`ZIP archive created: ${zipPath} (${archive.pointer()} bytes)`);
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
      res.setHeader('Content-Type', 'application/zip');
      
      // Stream the file
      const zipStream = fs.createReadStream(zipPath);
      zipStream.pipe(res);
      
      // Clean up ZIP file after sending (or on error)
      zipStream.on('end', () => {
        console.log(`ZIP file sent successfully`);
        setTimeout(() => {
          try {
            if (fs.existsSync(zipPath)) {
              fs.unlinkSync(zipPath);
              console.log(`Cleaned up ZIP file: ${zipPath}`);
            }
          } catch (cleanupErr) {
            console.error(`Error cleaning up ZIP file:`, cleanupErr);
          }
        }, 1000);
      });
      
      zipStream.on('error', (err) => {
        console.error(`Error streaming ZIP file:`, err);
      });
    });
    
    // Pipe archive data to the output file
    archive.pipe(output);
    
    // Track the files being added for logging
    const fileList = [];
    
    // Add each file to the archive
    validJobs.forEach(job => {
      const filename = path.basename(job.output);
      fileList.push(filename);
      console.log(`Adding file to ZIP: ${filename} (${fs.statSync(job.output).size} bytes)`);
      archive.file(job.output, { name: filename });
    });
    
    console.log(`Finalizing ZIP with ${fileList.length} files: ${fileList.join(', ')}`);
    
    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error(`Error in batch download:`, error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Batch download failed', details: error.message });
    }
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Documentation available at: http://localhost:${PORT}/docs`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`For production deployment, make sure to build the client with: npm run build`);
}); 