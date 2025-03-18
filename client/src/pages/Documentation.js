import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DocumentationIcon from '@mui/icons-material/MenuBook';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ApiIcon from '@mui/icons-material/Api';
import CodeIcon from '@mui/icons-material/Code';

const StyledIframe = styled('iframe')`
  width: 100%;
  height: 600px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doc-tabpanel-${index}`}
      aria-labelledby={`doc-tab-${index}`}
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

function Documentation() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setLoading(true);
  };
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // Define the documentation URLs
  const docUrls = [
    '/docs/index.html',
    '/docs/architecture.html',
    `/docs/images/architecture-diagram.svg`
  ];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Documentation
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Learn how to use the Advanced File Converter and explore its architecture.
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<DocumentationIcon />} label="User Guide" />
          <Tab icon={<ArchitectureIcon />} label="Architecture" />
          <Tab icon={<ApiIcon />} label="Diagram" />
        </Tabs>
        
        <Box sx={{ position: 'relative' }}>
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1,
              bgcolor: 'rgba(255,255,255,0.7)'
            }}>
              <CircularProgress />
            </Box>
          )}
          
          <TabPanel value={tabValue} index={0}>
            <StyledIframe 
              src={docUrls[0]} 
              title="User Guide" 
              onLoad={handleIframeLoad}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <StyledIframe 
              src={docUrls[1]} 
              title="Architecture" 
              onLoad={handleIframeLoad}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <StyledIframe 
              src={docUrls[2]} 
              title="Architecture Diagram" 
              onLoad={handleIframeLoad}
            />
          </TabPanel>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DocumentationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                User Guide
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                Learn how to use the Advanced File Converter effectively. This guide covers all features and provides step-by-step instructions.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={() => setTabValue(0)}
              >
                View Guide
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ArchitectureIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Architecture
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                Explore the system architecture of the Advanced File Converter, including components, data flow, and technology stack.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={() => setTabValue(1)}
              >
                View Architecture
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                API Reference
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                Technical reference for developers who want to integrate with the Advanced File Converter API.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                href="/docs/index.html#api-reference"
                target="_blank"
              >
                View API Docs
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Documentation; 