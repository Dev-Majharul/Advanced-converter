import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Box } from '@mui/material';

const FloatingText = ({
  text,
  color = '#FFFFFF',
  size = 'h3',
  glow = true,
  glowColor = 'rgba(139, 92, 246, 0.7)',
  duration = 3,
  delay = 0,
}) => {
  // Animation for individual characters
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        delayChildren: delay * 0.5,
      },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Split the text into individual characters for animation
  const characters = Array.from(text);

  return (
    <Box 
      sx={{ 
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {glow && (
        <Typography
          variant={size}
          component="div"
          sx={{
            position: 'absolute',
            color: glowColor,
            filter: `blur(20px)`,
            top: 0,
            left: 0,
            right: 0,
            opacity: 0.7,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {text}
        </Typography>
      )}
      
      <motion.div
        style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {characters.map((char, index) => (
          <motion.div
            key={`${char}-${index}`}
            variants={child}
            style={{ 
              display: 'inline-block',
              marginRight: char === ' ' ? '0.5em' : '0',
            }}
          >
            <Typography 
              variant={size} 
              component="span"
              sx={{ 
                color,
                display: 'inline-block',
                whiteSpace: 'pre',
                animation: glow 
                  ? `glow ${duration}s ease-in-out infinite alternate` 
                  : 'none',
                '@keyframes glow': {
                  '0%': {
                    textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}40`,
                  },
                  '100%': {
                    textShadow: `0 0 5px ${glowColor}, 0 0 10px ${glowColor}40`,
                  },
                },
              }}
            >
              {char}
            </Typography>
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
};

export default FloatingText; 