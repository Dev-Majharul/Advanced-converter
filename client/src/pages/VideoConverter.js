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
  TextField, 
  Button, 
  Alert, 
  Divider, 
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';

const videoFormats = {
  'video/mp4': '.mp4',
  'video/x-matroska': '.mkv',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
  'video/x-msvideo': '.avi',
  'video/mpeg': '.mpeg, .mpg'
};

const outputFormats = [
  { value: 'mp4', label: 'MP4' },
  { value: 'webm', label: 'WebM' },
  { value: 'avi', label: 'AVI' },
  { value: 'mov', label: 'MOV' },
  { value: 'gif', label: 'GIF (Animated)' },
];

const resolutionOptions = [
  { value: 'original', label: 'Original' },
  { value: '1080p', label: '1080p (1920x1080)' },
  { value: '720p', label: '720p (1280x720)' },
  { value: '480p', label: '480p (854x480)' },
  { value: '360p', label: '360p (640x360)' },
];

function VideoConverter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formatOptions, setFormatOptions] = useState({
    format: 'mp4',
    resolution: 'original',
    extractAudio: false,
    trim: false,
    startTime: '00:00:00',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      // For video, we could create a poster/thumbnail here
      // But for simplicity, we'll just store the file information
      setPreview(file.name);
    } else {
      setPreview('');
    }
  };

  const handleFormatChange = (event) => {
    setFormatOptions({
      ...formatOptions,
      format: event.target.value,
    });
  };

  const handleResolutionChange = (event) => {
    setFormatOptions({
      ...formatOptions,
      resolution: event.target.value,
    });
  };

  const handleSwitchChange = (name) => (event) => {
    setFormatOptions({
      ...formatOptions,
      [name]: event.target.checked,
    });
  };

  const handleTimeChange = (field, value) => {
    setFormatOptions({
      ...formatOptions,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('format', formatOptions.format);
    formData.append('resolution', formatOptions.resolution);
    formData.append('extractAudio', formatOptions.extractAudio);
    
    if (formatOptions.trim) {
      formData.append('startTime', formatOptions.startTime);
      if (formatOptions.endTime) {
        formData.append('endTime', formatOptions.endTime);
      }
    }

    try {
      const response = await axios.post('/api/convert/video', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // Create a download link for the resulting file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = formatOptions.extractAudio ? 'mp3' : formatOptions.format;
      const filename = `converted-video.${extension}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess(`Video successfully converted to ${formatOptions.format.toUpperCase()}`);
    } catch (err) {
      setError('Error converting video. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Video Converter
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Convert your videos between different formats with advanced options.
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <VisibilityIcon sx={{ mr: 1 }} /> Upload Video
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FileUploader 
              acceptedFileTypes={videoFormats}
              maxFileSize={500 * 1024 * 1024} // 500MB for videos
              onFileSelect={handleFileSelect}
              title="Upload Video to Convert"
            />

            {preview && (
              <Box mt={2} sx={{ textAlign: 'center', p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Video: {preview}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Video preview is not available. The file will be processed server-side.
                </Typography>
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
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="resolution-label">Resolution</InputLabel>
              <Select
                labelId="resolution-label"
                value={formatOptions.resolution}
                onChange={handleResolutionChange}
                label="Resolution"
              >
                {resolutionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formatOptions.extractAudio}
                  onChange={handleSwitchChange('extractAudio')}
                  color="primary"
                />
              }
              label="Extract audio only (MP3)"
              sx={{ mt: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formatOptions.trim}
                  onChange={handleSwitchChange('trim')}
                  color="primary"
                />
              }
              label="Trim video"
              sx={{ mt: 1, display: 'block' }}
            />
            
            {formatOptions.trim && (
              <Grid container spacing={2} mt={1}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Time (HH:MM:SS)"
                    value={formatOptions.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    fullWidth
                    placeholder="00:00:00"
                    inputProps={{ pattern: "\\d{2}:\\d{2}:\\d{2}" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Time (HH:MM:SS)"
                    value={formatOptions.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    fullWidth
                    placeholder="00:05:00"
                    inputProps={{ pattern: "\\d{2}:\\d{2}:\\d{2}" }}
                  />
                </Grid>
              </Grid>
            )}
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
            >
              {loading ? 'Converting...' : 'Convert & Download'}
            </Button>
            
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Video conversion may take a few minutes depending on the file size and options selected.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default VideoConverter; 