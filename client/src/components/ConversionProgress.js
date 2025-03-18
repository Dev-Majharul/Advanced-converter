import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';

const ConversionProgress = ({ job, onClose }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  
  useEffect(() => {
    // Clean up preview URL on component unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Calculate color based on status
  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'primary';
    }
  };
  
  // Calculate icon based on status
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };
  
  // Download the converted file
  const handleDownload = async () => {
    if (!job.downloadUrl) return;
    
    try {
      const response = await axios.get(job.downloadUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', job.filename || 'converted-file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };
  
  // Preview the converted file
  const handlePreview = async () => {
    if (!job.id) return;
    
    try {
      const response = await axios.get(`/api/preview/${job.id}`, {
        responseType: 'blob'
      });
      
      const contentType = response.headers['content-type'] || response.data.type;
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      
      // Determine what type of preview to show
      if (contentType.startsWith('image/')) {
        setPreviewType('image');
      } else if (contentType.startsWith('video/')) {
        setPreviewType('video');
      } else if (contentType === 'application/pdf') {
        setPreviewType('pdf');
      } else {
        setPreviewType('unsupported');
      }
      
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Preview error:', error);
    }
  };
  
  // Close the preview dialog
  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };
  
  // Render preview content based on type
  const renderPreviewContent = () => {
    switch (previewType) {
      case 'image':
        return (
          <Box sx={{ textAlign: 'center', overflow: 'auto' }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '70vh' }} 
            />
          </Box>
        );
      case 'video':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <video 
              controls 
              autoPlay 
              src={previewUrl} 
              style={{ maxWidth: '100%', maxHeight: '70vh' }} 
            />
          </Box>
        );
      case 'pdf':
        return (
          <Box sx={{ height: '70vh', width: '100%' }}>
            <iframe 
              src={previewUrl} 
              title="PDF Preview" 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }} 
            />
          </Box>
        );
      default:
        return (
          <Typography>
            This file type cannot be previewed. Please download the file to view it.
          </Typography>
        );
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
      {onClose && (
        <IconButton 
          size="small" 
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {getStatusIcon()}
        <Typography variant="subtitle1" sx={{ ml: getStatusIcon() ? 1 : 0 }}>
          {job.status === 'completed' 
            ? 'Conversion Complete' 
            : job.status === 'error' 
              ? 'Conversion Failed' 
              : job.status || 'Processing...'}
        </Typography>
      </Box>
      
      {job.status !== 'error' && (
        <LinearProgress 
          variant={job.status === 'completed' ? 'determinate' : 'indeterminate'} 
          value={job.progress || 0}
          color={getStatusColor()}
          sx={{ mb: 2, height: 8, borderRadius: 1 }}
        />
      )}
      
      {job.timeLeft && (
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Time remaining: {job.timeLeft}
        </Typography>
      )}
      
      {job.error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Error: {job.error}
        </Typography>
      )}
      
      {job.status === 'completed' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<VisibilityIcon />} 
            onClick={handlePreview}
            sx={{ mr: 1 }}
          >
            Preview
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleDownload}
          >
            Download
          </Button>
        </Box>
      )}
      
      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          File Preview
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {renderPreviewContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          <Button variant="contained" onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ConversionProgress; 