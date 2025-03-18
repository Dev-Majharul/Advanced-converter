import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Button,
  Divider,
  Chip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSocket } from '../context/SocketContext';
import ConversionProgress from '../components/ConversionProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

function JobsDashboard() {
  const [tabValue, setTabValue] = React.useState(0);
  const { jobs, clearJob, clearAllJobs } = useSocket();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const activeJobs = Object.values(jobs).filter(job => job.status !== 'completed' && job.status !== 'error');
  const completedJobs = Object.values(jobs).filter(job => job.status === 'completed');
  const failedJobs = Object.values(jobs).filter(job => job.status === 'error');
  
  // Get the jobs to display based on the current tab
  const getJobsToDisplay = () => {
    switch (tabValue) {
      case 0:
        return activeJobs;
      case 1:
        return completedJobs;
      case 2:
        return failedJobs;
      default:
        return Object.values(jobs);
    }
  };
  
  const handleClearAllJobs = () => {
    if (window.confirm('Are you sure you want to clear all jobs?')) {
      clearAllJobs();
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Jobs Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<DeleteIcon />} 
          color="error"
          onClick={handleClearAllJobs}
          disabled={Object.keys(jobs).length === 0}
        >
          Clear All
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? 'fullWidth' : 'standard'}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RefreshIcon sx={{ mr: 1 }} />
                Active
                {activeJobs.length > 0 && (
                  <Chip 
                    label={activeJobs.length} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DoneIcon sx={{ mr: 1 }} />
                Completed
                {completedJobs.length > 0 && (
                  <Chip 
                    label={completedJobs.length} 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon sx={{ mr: 1 }} />
                Failed
                {failedJobs.length > 0 && (
                  <Chip 
                    label={failedJobs.length} 
                    size="small" 
                    color="error" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </Box>
            } 
          />
        </Tabs>
        
        <Divider />
        
        <Box p={3}>
          {getJobsToDisplay().length === 0 && (
            <Box py={4} textAlign="center">
              <FolderOpenIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
              <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                {tabValue === 0
                  ? 'No active jobs'
                  : tabValue === 1
                    ? 'No completed jobs'
                    : 'No failed jobs'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {tabValue === 0
                  ? 'Convert files to see active jobs here'
                  : tabValue === 1
                    ? 'Successfully converted files will appear here'
                    : 'Failed conversions will appear here'}
              </Typography>
            </Box>
          )}
          
          {getJobsToDisplay().map(job => (
            <ConversionProgress 
              key={job.id} 
              job={job} 
              onClose={() => clearJob(job.id)} 
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default JobsDashboard; 