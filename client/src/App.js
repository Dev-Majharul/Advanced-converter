import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ImageConverter from './pages/ImageConverter';
import VideoConverter from './pages/VideoConverter';
import PdfConverter from './pages/PdfConverter';
import JobsDashboard from './pages/JobsDashboard';
import Documentation from './pages/Documentation';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/image" element={<ImageConverter />} />
              <Route path="/video" element={<VideoConverter />} />
              <Route path="/pdf" element={<PdfConverter />} />
              <Route path="/jobs" element={<JobsDashboard />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </Container>
          <Box 
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[200]
                  : theme.palette.grey[900],
            }}
          >
            <Container maxWidth="sm">
              <Box textAlign="center">
                Advanced File Converter © 2025 Md Majharul Islam
                <Box component="p" sx={{ fontSize: '0.75rem', mt: 1 }}>
                  <a href="https://github.com/dev-majharul" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', marginRight: '10px' }}>GitHub</a>
                  <a href="https://www.linkedin.com/in/md-majharul-islam-samir/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', marginRight: '10px' }}>LinkedIn</a>
                  <span>Contact: +8809696039963</span>
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>
      </Router>
    </SocketProvider>
  );
}

export default App; 