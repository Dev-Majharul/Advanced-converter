import React from 'react';
import { Grid, Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SceneContainer from '../components/3d/SceneContainer';
import FloatingModel from '../components/3d/FloatingModel';
import FloatingText from '../components/3d/FloatingText';
import ConverterModelSvg from '../assets/3d/converterModel';

const converterOptions = [
  {
    title: 'Image Converter',
    description: 'Convert between image formats like JPG, PNG, WEBP, GIF, etc. Apply effects and resize.',
    icon: <ImageIcon sx={{ fontSize: 60 }} />,
    path: '/image',
    formats: 'JPG, PNG, WEBP, BMP, TIFF, GIF',
    color: '#8B5CF6',
  },
  {
    title: 'Video Converter',
    description: 'Convert videos to different formats. Extract audio, change resolution and more.',
    icon: <MovieIcon sx={{ fontSize: 60 }} />,
    path: '/video',
    formats: 'MP4, MKV, AVI, MOV, WEBM, GIF',
    color: '#3B82F6',
  },
  {
    title: 'PDF Tools',
    description: 'Merge, split, compress, and convert PDFs to and from other formats.',
    icon: <PictureAsPdfIcon sx={{ fontSize: 60 }} />,
    path: '/pdf',
    formats: 'PDF, DOC, DOCX, TXT, JPG, PNG',
    color: '#10B981',
  },
  {
    title: 'Documentation',
    description: 'Learn how to use the converter, explore its architecture, and view the API reference.',
    icon: <MenuBookIcon sx={{ fontSize: 60 }} />,
    path: '/docs',
    formats: 'User Guide, Architecture, API Reference',
    color: '#F59E0B',
  }
];

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
    }
  }
};

function Dashboard() {
  return (
    <Box>
      {/* Hero section with 3D elements */}
      <Box 
        sx={{ 
          position: 'relative',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 10,
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
        >
          <SceneContainer height="100%" particles={true} controls={false}>
            <FloatingModel position={[0, 0, 0]} size={2} color="#8B5CF6" />
          </SceneContainer>
        </Box>
        
        <Box 
          sx={{
            textAlign: 'center', 
            zIndex: 2,
            mt: 4,
            px: 2,
          }}
        >
          <Box mb={3}>
            <FloatingText
              text="Advanced File Converter"
              size="h1"
              color="#FFFFFF"
              glowColor="rgba(139, 92, 246, 0.7)"
              duration={4}
            />
          </Box>
          
          <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 5 }}>
            <FloatingText
              text="Fast, reliable conversion between multiple file formats with advanced options"
              size="h6"
              color="#E2E8F0"
              glowColor="rgba(139, 92, 246, 0.4)"
              duration={3}
              delay={0.5}
            />
          </Box>
          
          <Box 
            sx={{
              maxWidth: '450px',
              mx: 'auto', 
              position: 'relative',
              zIndex: 2,
              mt: 3,
            }}
          >
            <Box sx={{ position: 'relative', width: '100%', height: '300px' }}>
              <ConverterModelSvg />
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Conversion options with staggered animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Grid container spacing={4}>
          {converterOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={option.title}>
              <motion.div variants={itemVariants}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => `0 15px 30px -10px ${option.color}40`,
                  },
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Glow effect on hover */}
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `radial-gradient(circle at center, ${option.color}20 0%, transparent 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  />
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 3,
                      color: option.color,
                      position: 'relative',
                    }}
                  >
                    {option.icon}
                    {/* Circular glow around icon */}
                    <Box 
                      sx={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${option.color}40 0%, transparent 70%)`,
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {option.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" component="p">
                      Supported formats: {option.formats}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      component={RouterLink} 
                      to={option.path} 
                      size="large" 
                      color="primary" 
                      variant="contained"
                      fullWidth
                      sx={{
                        background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}DD 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${option.color}DD 0%, ${option.color} 100%)`,
                        }
                      }}
                    >
                      Start Converting
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
      
      <Box mt={12} textAlign="center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <FloatingText
            text="Why choose our converter?"
            size="h4"
            glow={true}
            color="#FFFFFF"
            glowColor="rgba(139, 92, 246, 0.5)"
            duration={3}
          />
          
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mt: 2,
              px: 2,
              lineHeight: 1.8,
            }}
          >
            Our advanced conversion tools offer high quality output with fine control over 
            the conversion process. All processing happens locally on your device for maximum privacy.
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
}

export default Dashboard; 