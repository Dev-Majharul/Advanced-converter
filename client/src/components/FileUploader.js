import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, LinearProgress, Button, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

function FileUploader({ 
  acceptedFileTypes, 
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  onFileSelect,
  multiple = false,
  title = 'Upload Files'
}) {
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');

  // Debug logging
  console.log("FileUploader rendered with multiple:", multiple);
  
  // Define accepted file types for direct MIME type matching
  // This is more reliable than the complex format from acceptedFileTypes
  const acceptObject = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif']
  };

  useEffect(() => {
    console.log("FileUploader mounted with accept config:", acceptObject);
  }, []);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    console.log("Dropzone onDrop called");
    console.log("Accepted files:", acceptedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    console.log("Rejected files:", rejectedFiles.map(f => ({ 
      name: f.file.name, 
      errors: f.errors 
    })));
    
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Process accepted files
      // For non-multiple mode, just take the first file
      const filesToUse = multiple ? acceptedFiles : [acceptedFiles[0]];
      
      // Apply size validation manually to be sure
      const oversizedFiles = filesToUse.filter(file => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        const sizeErrorMsg = `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Max size is ${Math.round(maxFileSize/1024/1024)}MB.`;
        setFileError(sizeErrorMsg);
        return;
      }
      
      // Validate file extensions manually
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
      const invalidFiles = filesToUse.filter(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return !validExtensions.includes(ext);
      });
      
      if (invalidFiles.length > 0) {
        const typeErrorMsg = `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Allowed: ${validExtensions.join(', ')}`;
        setFileError(typeErrorMsg);
        return;
      }
      
      // All validations passed
      console.log("Files validated successfully:", filesToUse.map(f => f.name));
      setFiles(filesToUse);
      setFileError('');
      
      // Notify parent component
      if (onFileSelect) {
        onFileSelect(multiple ? filesToUse : filesToUse[0]);
      }
    }
    
    // Handle explicit rejections
    if (rejectedFiles && rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        if (file.file.size > maxFileSize) {
          return `${file.file.name} is too large (${Math.round(file.file.size/1024/1024)}MB). Max size: ${Math.round(maxFileSize/1024/1024)}MB.`;
        }
        return `${file.file.name} is not a valid image file.`;
      });
      
      setFileError(errors.join(' '));
    }
  }, [maxFileSize, multiple, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptObject,
    maxSize: maxFileSize,
    multiple: multiple,
    noClick: false,
    noKeyboard: false
  });

  const clearFiles = () => {
    setFiles([]);
    setFileError('');
    if (onFileSelect) {
      onFileSelect(multiple ? [] : null);
    }
  };

  // Create a readable list of accepted file extensions for display
  const acceptedExtensions = '.jpg, .jpeg, .png, .gif, .webp, .bmp, .tiff, .tif';

  return (
    <Box my={3}>
      <Paper
        {...getRootProps()}
        sx={{
          padding: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: theme => isDragActive ? theme.palette.action.hover : theme.palette.background.paper,
          border: theme => `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          transition: 'all 0.3s',
          '&:hover': {
            backgroundColor: theme => theme.palette.action.hover,
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {isDragActive
            ? 'Drop the files here...'
            : multiple
              ? 'Drag & drop files here, or click to select files'
              : 'Drag & drop a file here, or click to select a file'}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Accepted file types: {acceptedExtensions}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          Max file size: {maxFileSize / (1024 * 1024)}MB
        </Typography>
        {multiple && (
          <Typography variant="caption" color="primary" display="block" mt={1}>
            Multiple file selection enabled
          </Typography>
        )}
      </Paper>

      {fileError && (
        <Typography color="error" variant="body2" mt={1}>
          {fileError}
        </Typography>
      )}

      {/* When files are dropped */}
      {files.length > 0 && (
        <Box mt={2}>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            mb={1}
          >
            <Typography variant="subtitle2">
              Selected {files.length > 1 ? `Files (${files.length})` : 'File'}:
            </Typography>
            <Button 
              size="small"
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={clearFiles}
            >
              Clear All
            </Button>
          </Stack>
          
          {files.map((file, index) => (
            <Box 
              key={index} 
              sx={{ 
                mt: 1, 
                p: 1, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="body2" noWrap>
                  {file.name} 
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {file.type} • {(file.size / 1024).toFixed(1)} KB
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ mt: 0.5, height: 3 }} 
                />
              </Box>
              <Button 
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  // Remove this specific file
                  const newFiles = [...files];
                  newFiles.splice(index, 1);
                  setFiles(newFiles);
                  if (onFileSelect) {
                    onFileSelect(multiple ? newFiles : newFiles.length > 0 ? newFiles[0] : null);
                  }
                }}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
      
      {/* Add a manual file selection button as backup */}
      {files.length === 0 && (
        <Button
          variant="outlined"
          onClick={open}
          fullWidth
          sx={{ mt: 2 }}
        >
          Select file{multiple ? 's' : ''} manually
        </Button>
      )}
    </Box>
  );
}

export default FileUploader; 