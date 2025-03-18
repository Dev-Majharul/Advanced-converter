import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Box, useMediaQuery, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Image Converter', path: '/image' },
  { name: 'Video Converter', path: '/video' },
  { name: 'PDF Tools', path: '/pdf' },
  { name: 'Documentation', path: '/docs' },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { jobs } = useSocket();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Count active jobs
  const activeJobsCount = Object.values(jobs).filter(
    job => job.status !== 'completed' && job.status !== 'error'
  ).length;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AutoAwesomeIcon sx={{ mr: 1 }} /> Converter
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.name} 
            component={RouterLink} 
            to={item.path} 
            sx={{ 
              textAlign: 'center', 
              color: 'inherit', 
              textDecoration: 'none', 
              bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent'
            }}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        <ListItem 
          component={RouterLink} 
          to="/jobs" 
          sx={{ 
            textAlign: 'center', 
            color: 'inherit', 
            textDecoration: 'none',
            bgcolor: location.pathname === '/jobs' ? 'action.selected' : 'transparent'
          }}
        >
          <ListItemText primary="Jobs Dashboard" />
          {activeJobsCount > 0 && (
            <Badge badgeContent={activeJobsCount} color="primary" sx={{ ml: 1 }} />
          )}
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <AutoAwesomeIcon sx={{ mr: 1 }} /> Advanced Converter
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button 
                key={item.name} 
                component={RouterLink} 
                to={item.path}
                sx={{ 
                  color: 'inherit', 
                  mx: 1,
                  bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  } 
                }}
              >
                {item.name}
              </Button>
            ))}
            <Button 
              component={RouterLink} 
              to="/jobs"
              sx={{ 
                color: 'inherit', 
                mx: 1,
                bgcolor: location.pathname === '/jobs' ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                } 
              }}
              startIcon={
                <Badge badgeContent={activeJobsCount} color="primary">
                  <NotificationsIcon />
                </Badge>
              }
            >
              Jobs
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Header; 