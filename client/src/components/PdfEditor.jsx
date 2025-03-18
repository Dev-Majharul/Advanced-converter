import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Divider, 
  Tooltip, 
  IconButton,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import GestureIcon from '@mui/icons-material/Gesture';
import HighlightIcon from '@mui/icons-material/Highlight';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import SignatureIcon from '@mui/icons-material/DriveFileRenameOutline';
import ShapeIcon from '@mui/icons-material/Category';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfEditor = ({ pdfUrl, onSave }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [tool, setTool] = useState('cursor');
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [color, setColor] = useState('#FF0000');
  const [fontSize, setFontSize] = useState(16);
  const [text, setText] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (!pdfUrl) return;
    
    // Load PDF document and initialize editor
    setLoading(true);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);
  
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };
  
  const handleToolChange = (newTool) => {
    setTool(newTool);
    
    if (newTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleColorChange = (event) => {
    setColor(event.target.value);
  };
  
  const handleFontSizeChange = (event, newValue) => {
    setFontSize(newValue);
  };
  
  const handleTextChange = (event) => {
    setText(event.target.value);
  };
  
  const handleAddText = () => {
    if (!text) return;
    
    const newAnnotation = {
      id: Date.now(),
      type: 'text',
      text,
      x: 100,
      y: 100,
      fontSize,
      color,
      page: pageNumber
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setText('');
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const newAnnotation = {
        id: Date.now(),
        type: 'image',
        src: e.target.result,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        page: pageNumber
      };
      
      setAnnotations([...annotations, newAnnotation]);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Here we would send the PDF and annotations to the server
      // for processing and get back the edited PDF
      
      // Simulated save operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call onSave with the result
      if (onSave) {
        onSave({
          success: true,
          message: 'PDF saved successfully',
          downloadUrl: '/api/download/sample-edited.pdf'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error saving PDF:', error);
      setLoading(false);
      
      if (onSave) {
        onSave({
          success: false,
          message: 'Error saving PDF'
        });
      }
    }
  };
  
  const renderAnnotation = (annotation) => {
    if (annotation.page !== pageNumber) return null;
    
    switch (annotation.type) {
      case 'text':
        return (
          <div
            key={annotation.id}
            style={{
              position: 'absolute',
              left: `${annotation.x}px`,
              top: `${annotation.y}px`,
              color: annotation.color,
              fontSize: `${annotation.fontSize}px`,
              cursor: 'move',
              userSelect: 'none'
            }}
          >
            {annotation.text}
          </div>
        );
      case 'image':
        return (
          <img
            key={annotation.id}
            src={annotation.src}
            alt="Uploaded"
            style={{
              position: 'absolute',
              left: `${annotation.x}px`,
              top: `${annotation.y}px`,
              width: `${annotation.width}px`,
              height: `${annotation.height}px`,
              cursor: 'move',
              userSelect: 'none'
            }}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', mb: 1 }}>
        <Tooltip title="Text Tool">
          <IconButton 
            color={tool === 'text' ? 'primary' : 'default'} 
            onClick={() => handleToolChange('text')}
          >
            <TextFieldsIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Image Tool">
          <IconButton 
            color={tool === 'image' ? 'primary' : 'default'} 
            onClick={() => handleToolChange('image')}
          >
            <ImageIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Draw Tool">
          <IconButton 
            color={tool === 'draw' ? 'primary' : 'default'} 
            onClick={() => handleToolChange('draw')}
          >
            <BorderColorIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Highlight Tool">
          <IconButton 
            color={tool === 'highlight' ? 'primary' : 'default'} 
            onClick={() => handleToolChange('highlight')}
          >
            <HighlightIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Shape Tool">
          <IconButton 
            color={tool === 'shape' ? 'primary' : 'default'} 
            onClick={() => handleToolChange('shape')}
          >
            <ShapeIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Signature Tool">
          <IconButton 
            color={tool === 'signature' ? 'primary' : 'default'} 
            onClick={() => handleToolChange('signature')}
          >
            <SignatureIcon />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          style={{ width: '30px', height: '30px', border: 'none', padding: 0, marginRight: '8px' }}
        />
        
        <Box sx={{ width: 100, mx: 1 }}>
          <Slider
            size="small"
            value={fontSize}
            min={8}
            max={72}
            onChange={handleFontSizeChange}
            aria-label="Font Size"
          />
        </Box>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <Tooltip title="Undo">
          <IconButton disabled>
            <UndoIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Redo">
          <IconButton disabled>
            <RedoIcon />
          </IconButton>
        </Tooltip>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Tooltip title="Save">
          <IconButton color="primary" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <SaveIcon />}
          </IconButton>
        </Tooltip>
      </Paper>
      
      {/* Text properties when text tool is selected */}
      {tool === 'text' && (
        <Paper sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Enter text"
            value={text}
            onChange={handleTextChange}
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleAddText} 
            disabled={!text}
          >
            Add Text
          </Button>
        </Paper>
      )}
      
      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
      
      {/* PDF Viewer */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<CircularProgress />}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            
            {/* Render annotations */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
              {annotations.map(renderAnnotation)}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Page navigation */}
      <Paper sx={{ p: 1, mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button 
          disabled={pageNumber <= 1 || loading} 
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </Button>
        
        <Typography sx={{ mx: 2 }}>
          Page {pageNumber} of {numPages || '--'}
        </Typography>
        
        <Button 
          disabled={pageNumber >= numPages || loading} 
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </Button>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        
        <Typography sx={{ mr: 1 }}>Zoom:</Typography>
        <Box sx={{ width: 100 }}>
          <Slider
            size="small"
            value={scale}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(e, newValue) => setScale(newValue)}
            aria-label="Zoom"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default PdfEditor; 