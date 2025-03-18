import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Tabs,
  Tab,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Alert, 
  Divider, 
  CircularProgress,
  FormControlLabel,
  Checkbox,
  TextField
} from '@mui/material';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import PdfEditor from '../components/PdfEditor';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import CompressIcon from '@mui/icons-material/Compress';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import TransformIcon from '@mui/icons-material/Transform';
import EditIcon from '@mui/icons-material/Edit';

const pdfFormats = {
  'application/pdf': '.pdf',
};

const imageFormats = {
  'image/jpeg': '.jpg, .jpeg',
  'image/png': '.png',
};

const documentFormats = {
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pdf-tabpanel-${index}`}
      aria-labelledby={`pdf-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

function PdfConverter() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressOptions, setCompressOptions] = useState({
    quality: 'medium', // high, medium, low
  });
  const [convertOptions, setConvertOptions] = useState({
    format: 'docx',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editorUrl, setEditorUrl] = useState('');
  const [editorPdfUrl, setEditorPdfUrl] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedFiles([]);
    setError('');
    setSuccess('');
  };

  const handleFileSelect = (files) => {
    if (Array.isArray(files)) {
      setSelectedFiles(files);
    } else {
      setSelectedFiles([files]);
    }
  };

  const handleConvertFormatChange = (event) => {
    setConvertOptions({
      ...convertOptions,
      format: event.target.value,
    });
  };

  const handleCompressQualityChange = (event) => {
    setCompressOptions({
      ...compressOptions,
      quality: event.target.value,
    });
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select file(s) first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    
    // Different operations depending on the tab
    switch (tabValue) {
      case 0: // Compress
        formData.append('operation', 'compress');
        formData.append('file', selectedFiles[0]);
        formData.append('quality', compressOptions.quality);
        break;
      case 1: // Merge
        formData.append('operation', 'merge');
        selectedFiles.forEach((file, index) => {
          formData.append(`file-${index}`, file);
        });
        break;
      case 2: // Split
        formData.append('operation', 'split');
        formData.append('file', selectedFiles[0]);
        break;
      case 3: // Convert
        formData.append('operation', 'convert');
        formData.append('file', selectedFiles[0]);
        formData.append('format', convertOptions.format);
        break;
      case 4: // Edit
        formData.append('operation', 'edit');
        formData.append('file', selectedFiles[0]);
        try {
          const response = await axios.post('/api/convert/pdf/prepare-editor', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          
          // Store both the editor URL and the PDF content URL
          setEditorUrl(response.data.editorUrl);
          setEditorPdfUrl(`/api/pdf-content/${response.data.jobId}`);
          setLoading(false);
          return; // Return early as we're handling this differently
        } catch (err) {
          setError('Error preparing PDF editor. Please try again.');
          console.error(err);
          setLoading(false);
          return;
        }
      default:
        break;
    }

    try {
      // This is a placeholder as we have not implemented the server-side for PDF yet
      setSuccess('PDF operation would be processed here (server-side implementation pending)');
      setLoading(false);
      
      /* Actual implementation would be like:
      const response = await axios.post('/api/convert/pdf', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // Create a download link for the resulting file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = getOutputFilename(); // Function to generate appropriate name based on operation
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      */
      
    } catch (err) {
      setError('Error processing PDF. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleEditorSave = (result) => {
    if (result.success) {
      setSuccess(result.message || 'PDF edited successfully');
      // Reset the editor URL to allow uploading a new PDF
      setEditorUrl('');
      setEditorPdfUrl('');
    } else {
      setError(result.message || 'Error saving PDF');
    }
  };

  const getUploadOptions = () => {
    switch (tabValue) {
      case 0: // Compress
      case 2: // Split
        return {
          acceptedFileTypes: pdfFormats,
          multiple: false,
          title: tabValue === 0 ? 'Upload PDF to Compress' : 'Upload PDF to Split',
        };
      case 1: // Merge
        return {
          acceptedFileTypes: pdfFormats,
          multiple: true,
          title: 'Upload PDFs to Merge',
        };
      case 3: // Convert
      case 4: // Edit
        return {
          acceptedFileTypes: tabValue === 3 ? pdfFormats : pdfFormats,
          multiple: false,
          title: tabValue === 3 ? 'Upload File to Convert' : 'Upload PDF to Edit',
        };
      default:
        return {
          acceptedFileTypes: pdfFormats,
          multiple: false,
          title: 'Upload PDF',
        };
    }
  };

  const uploadOptions = getUploadOptions();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        PDF Tools
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Compress, merge, split, convert, and edit PDF files.
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

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<CompressIcon />} label="Compress" />
          <Tab icon={<MergeTypeIcon />} label="Merge" />
          <Tab icon={<CallSplitIcon />} label="Split" />
          <Tab icon={<TransformIcon />} label="Convert" />
          <Tab icon={<EditIcon />} label="Edit" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <FileUploader 
                acceptedFileTypes={uploadOptions.acceptedFileTypes}
                maxFileSize={50 * 1024 * 1024} // 50MB
                onFileSelect={handleFileSelect}
                multiple={uploadOptions.multiple}
                title={uploadOptions.title}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Compression Options
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="quality-label">Compression Quality</InputLabel>
                  <Select
                    labelId="quality-label"
                    value={compressOptions.quality}
                    onChange={handleCompressQualityChange}
                    label="Compression Quality"
                  >
                    <MenuItem value="high">High Quality (Larger Size)</MenuItem>
                    <MenuItem value="medium">Medium Quality (Balanced)</MenuItem>
                    <MenuItem value="low">Low Quality (Smaller Size)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Lower quality results in smaller file sizes but may reduce the visual quality.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FileUploader 
            acceptedFileTypes={uploadOptions.acceptedFileTypes}
            maxFileSize={100 * 1024 * 1024} // 100MB
            onFileSelect={handleFileSelect}
            multiple={uploadOptions.multiple}
            title={uploadOptions.title}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload multiple PDF files to merge them into a single PDF document. The files will be merged in the order they are selected.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <FileUploader 
            acceptedFileTypes={uploadOptions.acceptedFileTypes}
            maxFileSize={50 * 1024 * 1024} // 50MB
            onFileSelect={handleFileSelect}
            multiple={uploadOptions.multiple}
            title={uploadOptions.title}
          />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Upload a PDF file to split it into individual pages or custom page ranges. 
            The result will be a ZIP file containing the split PDF pages.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <FileUploader 
                acceptedFileTypes={uploadOptions.acceptedFileTypes}
                maxFileSize={50 * 1024 * 1024} // 50MB
                onFileSelect={handleFileSelect}
                multiple={uploadOptions.multiple}
                title={uploadOptions.title}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Conversion Options
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="format-label">Output Format</InputLabel>
                  <Select
                    labelId="format-label"
                    value={convertOptions.format}
                    onChange={handleConvertFormatChange}
                    label="Output Format"
                  >
                    <MenuItem value="docx">Word (DOCX)</MenuItem>
                    <MenuItem value="txt">Text (TXT)</MenuItem>
                    <MenuItem value="jpg">Image (JPG)</MenuItem>
                    <MenuItem value="png">Image (PNG)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Convert your PDF to other formats. Note that some conversions may not preserve all formatting.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              {!editorUrl ? (
                <FileUploader 
                  acceptedFileTypes={uploadOptions.acceptedFileTypes}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  onFileSelect={handleFileSelect}
                  multiple={uploadOptions.multiple}
                  title={uploadOptions.title}
                  subtitle="Upload a PDF file to edit text, add images, signatures, and more."
                />
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  height: '600px', 
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  overflow: 'hidden' 
                }}>
                  <PdfEditor pdfUrl={editorPdfUrl} onSave={handleEditorSave} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  PDF Editor
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" paragraph>
                  Edit PDF files online. Make powerful edits to your PDF documents:
                </Typography>
                
                <ul style={{ paddingLeft: '20px' }}>
                  <li><Typography variant="body2">Add, edit, or delete text</Typography></li>
                  <li><Typography variant="body2">Insert images and shapes</Typography></li>
                  <li><Typography variant="body2">Add annotations and comments</Typography></li>
                  <li><Typography variant="body2">Draw free-hand on PDF pages</Typography></li>
                  <li><Typography variant="body2">Add signatures to documents</Typography></li>
                  <li><Typography variant="body2">Fill out PDF forms</Typography></li>
                  <li><Typography variant="body2">Highlight, underline, or strike through text</Typography></li>
                  <li><Typography variant="body2">Reorder, rotate, or delete pages</Typography></li>
                </ul>
                
                {!editorUrl && (
                  <Button
                    variant="contained" 
                    color="primary"
                    fullWidth
                    disabled={selectedFiles.length === 0 || loading}
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
                  >
                    {loading ? 'Preparing Editor...' : 'Open Editor'}
                  </Button>
                )}
                
                {editorUrl && (
                  <Button
                    variant="outlined" 
                    color="primary"
                    fullWidth
                    onClick={() => {
                      setEditorUrl('');
                      setEditorPdfUrl('');
                    }}
                    sx={{ mt: 2 }}
                  >
                    Upload Another PDF
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {(tabValue !== 4 || !editorUrl) && (
          <Box sx={{ p: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || loading}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
            >
              {loading ? 'Processing...' : 'Process & Download'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default PdfConverter; 