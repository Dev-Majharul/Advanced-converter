import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  FormControlLabel, 
  Switch, 
  TextField, 
  Button, 
  Alert, 
  Divider, 
  CircularProgress,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSocket } from '../context/SocketContext';
import ConversionProgress from '../components/ConversionProgress';

// The FileUploader component now uses a simplified format internally
// This is kept for reference but not actually used anymore
const imageFormats = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tiff', '.tif']
};

const outputFormats = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'gif', label: 'GIF' },
  { value: 'bmp', label: 'BMP' },
  { value: 'tiff', label: 'TIFF' }
];

function ImageConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formatOptions, setFormatOptions] = useState({
    format: 'jpeg',
    quality: 80,
    width: '',
    height: '',
    maintainAspectRatio: true,
    grayscale: false,
    rotate: '',
    blur: '',
    sharpen: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeJobIds, setActiveJobIds] = useState([]);
  const [multipleFiles, setMultipleFiles] = useState(false);
  
  const { jobs, addJob } = useSocket();

  const handleFileSelect = (files) => {
    console.log("Files selected:", files);
    if (multipleFiles) {
      setSelectedFiles(Array.isArray(files) ? files : [files]);
      // Set preview to the first file if available
      if (files && files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      } else {
        setPreview('');
      }
    } else {
      // Single file mode
      const file = Array.isArray(files) ? files[0] : files;
      setSelectedFiles(file ? [file] : []);
      if (file) {
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview('');
      }
    }
  };

  const handleFormatChange = (event) => {
    setFormatOptions({
      ...formatOptions,
      format: event.target.value,
    });
  };

  const handleQualityChange = (event, newValue) => {
    setFormatOptions({
      ...formatOptions,
      quality: newValue,
    });
  };

  const handleDimensionChange = (dimension, value) => {
    setFormatOptions({
      ...formatOptions,
      [dimension]: value,
    });
  };

  const handleSwitchChange = (name) => (event) => {
    setFormatOptions({
      ...formatOptions,
      [name]: event.target.checked,
    });
  };

  const toggleMultipleFiles = () => {
    setMultipleFiles(!multipleFiles);
    setSelectedFiles([]);
    setPreview('');
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setActiveJobIds([]);

    try {
      // Log the selected files for debugging
      console.log("Selected files for conversion:", selectedFiles.map(f => ({
        name: f.name, 
        type: f.type, 
        size: f.size
      })));
      
      // Validate file sizes before uploading
      const oversizedFiles = selectedFiles.filter(file => file.size > 100 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        throw new Error(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')} (max 100MB each)`);
      }

      // Validate file types
      const invalidFiles = selectedFiles.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return !['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif'].includes(ext);
      });
      
      if (invalidFiles.length > 0) {
        throw new Error(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only image files are supported.`);
      }

      const formData = new FormData();
      
      // Append all files to the formData
      if (multipleFiles) {
        selectedFiles.forEach(file => {
          console.log(`Adding file to form: ${file.name}`);
          formData.append('file', file);
        });
      } else {
        console.log(`Adding single file to form: ${selectedFiles[0].name}`);
        formData.append('file', selectedFiles[0]);
      }
      
      // Log format options
      console.log("Conversion options:", formatOptions);
      
      formData.append('format', formatOptions.format);
      formData.append('quality', formatOptions.quality.toString());
      
      if (formatOptions.width) {
        formData.append('width', formatOptions.width.toString());
      }
      
      if (formatOptions.height) {
        formData.append('height', formatOptions.height.toString());
      }
      
      formData.append('maintainAspectRatio', formatOptions.maintainAspectRatio.toString());
      formData.append('grayscale', formatOptions.grayscale.toString());
      
      // Advanced options
      if (formatOptions.rotate) {
        formData.append('rotate', formatOptions.rotate.toString());
      }
      
      if (formatOptions.blur) {
        formData.append('blur', formatOptions.blur.toString());
      }
      
      formData.append('sharpen', formatOptions.sharpen.toString());

      console.log("Submitting conversion request");
      const response = await axios.post('/api/convert/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increase timeout to 60 seconds
      });
      
      console.log("Conversion response:", response.data);
      
      // Handle single job or multiple jobs
      if (response.data.jobId) {
        // Single job
        const jobId = response.data.jobId;
        setActiveJobIds([jobId]);
        addJob(jobId, {
          type: 'image',
          filename: `${selectedFiles[0].name.split('.')[0]}.${formatOptions.format}`,
          format: formatOptions.format,
          uploadTime: new Date()
        });
        
        setSuccess(`Converting ${selectedFiles[0].name}. Estimated time: ${response.data.estimatedTime}`);
      } else if (response.data.jobIds) {
        // Multiple jobs
        const jobIds = response.data.jobIds;
        setActiveJobIds(jobIds);
        
        // Create batch download link
        const batchDownloadUrl = `/api/download/batch?jobs=${jobIds.join(',')}`;
        
        jobIds.forEach((jobId, index) => {
          const file = selectedFiles[index] || selectedFiles[0];
          addJob(jobId, {
            type: 'image',
            filename: `${file.name.split('.')[0]}.${formatOptions.format}`,
            format: formatOptions.format,
            uploadTime: new Date(),
            batchDownloadUrl
          });
        });
        
        setSuccess(`Converting ${jobIds.length} files. Estimated time: ${response.data.estimatedTime}`);
      }
    } catch (err) {
      console.error("Conversion error:", err);
      let errorMessage = 'Error starting conversion. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        if (err.response.data.details) {
          errorMessage += ` (${err.response.data.details})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Log the exact error for debugging
      console.error("Full error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Get the active jobs if there are any
  const activeJobs = activeJobIds.map(id => jobs[id]).filter(Boolean);

  // Handle batch download for all converted files
  const handleBatchDownload = () => {
    // Check if we have a batch link from the first job
    if (activeJobs.length > 0 && activeJobs[0]?.batchDownloadUrl) {
      window.location.href = activeJobs[0].batchDownloadUrl;
    } else if (activeJobs.length > 1) {
      // Create a batch download link from job IDs
      const jobIds = activeJobs.map(job => job.id).join(',');
      window.location.href = `/api/download/batch?jobs=${jobIds}`;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Image Converter
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Convert your images between different formats with advanced options.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {/* Show active job progress if available */}
      {activeJobs.length > 0 && (
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" gutterBottom>
              Conversion Progress
            </Typography>
            {activeJobs.length > 1 && activeJobs.some(job => job.status === 'completed') && (
              <Button 
                variant="contained" 
                color="success" 
                size="small"
                onClick={handleBatchDownload}
                startIcon={<DownloadIcon />}
              >
                Download All ({activeJobs.filter(job => job.status === 'completed').length}/{activeJobs.length})
              </Button>
            )}
          </Box>
          {activeJobs.map(job => (
            <Box key={job.id} mb={2}>
              <ConversionProgress job={job} />
            </Box>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center">
                <VisibilityIcon sx={{ mr: 1 }} /> Upload & Preview
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={multipleFiles}
                    onChange={toggleMultipleFiles}
                    color="primary"
                  />
                }
                label="Multiple Files"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <FileUploader 
              acceptedFileTypes={imageFormats}
              maxFileSize={100 * 1024 * 1024} // 100MB (increased from 10MB)
              onFileSelect={handleFileSelect}
              multiple={multipleFiles}
              title={multipleFiles ? "Upload Images to Convert" : "Upload Image to Convert"}
            />

            {selectedFiles.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected {selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'File'}:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedFiles.map((file, index) => (
                    <Chip 
                      key={index}
                      label={file.name} 
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {preview && (
              <Box mt={2} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>Preview:</Typography>
                <Box 
                  component="img" 
                  src={preview} 
                  alt="Preview" 
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }} 
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <SettingsIcon sx={{ mr: 1 }} /> Conversion Options
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="format-label">Output Format</InputLabel>
              <Select
                labelId="format-label"
                value={formatOptions.format}
                onChange={handleFormatChange}
                label="Output Format"
              >
                {outputFormats.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box mt={3}>
              <Typography gutterBottom>
                Quality: {formatOptions.quality}%
              </Typography>
              <Slider
                value={formatOptions.quality}
                onChange={handleQualityChange}
                aria-labelledby="quality-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={10}
                max={100}
              />
            </Box>
            
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  label="Width (px)"
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formatOptions.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Height (px)"
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                  value={formatOptions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formatOptions.maintainAspectRatio}
                  onChange={handleSwitchChange('maintainAspectRatio')}
                  color="primary"
                />
              }
              label="Maintain aspect ratio"
              sx={{ mt: 1, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formatOptions.grayscale}
                  onChange={handleSwitchChange('grayscale')}
                  color="primary"
                />
              }
              label="Convert to grayscale"
              sx={{ mt: 1, mb: 2, display: 'block' }}
            />
            
            {/* Advanced Options */}
            <Box>
              <Button 
                variant="text" 
                color="primary"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                startIcon={<TuneIcon />}
                endIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                Advanced Options
              </Button>
              
              <Collapse in={advancedOpen}>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Rotate (degrees)"
                        type="number"
                        InputProps={{ inputProps: { min: -360, max: 360 } }}
                        value={formatOptions.rotate}
                        onChange={(e) => handleDimensionChange('rotate', e.target.value)}
                        fullWidth
                        margin="normal"
                        helperText="Rotate image (e.g. 90, 180, -90)"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Blur"
                        type="number"
                        InputProps={{ inputProps: { min: 0, max: 20, step: 0.1 } }}
                        value={formatOptions.blur}
                        onChange={(e) => handleDimensionChange('blur', e.target.value)}
                        fullWidth
                        margin="normal"
                        helperText="Apply blur (0.5 to 20)"
                      />
                    </Grid>
                  </Grid>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formatOptions.sharpen}
                        onChange={handleSwitchChange('sharpen')}
                        color="primary"
                      />
                    }
                    label="Sharpen image"
                    sx={{ mt: 1, display: 'block' }}
                  />
                </Box>
              </Collapse>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSubmit}
              disabled={!selectedFiles.length || loading}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
            >
              {loading ? 'Starting Conversion...' : 'Convert Image'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ImageConverter; 