import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const ConverterModelSvg = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 500 400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Background glow */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="fileGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          
          <linearGradient id="fileGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background element */}
        <motion.circle 
          cx="250" 
          cy="200" 
          r="150" 
          fill="url(#bgGlow)" 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Converter mechanism */}
        <g filter="url(#glow)">
          {/* Central converter circle */}
          <motion.circle
            cx="250"
            cy="200"
            r="60"
            fill="rgba(11, 15, 25, 0.8)"
            stroke="#8B5CF6"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
          
          {/* Rotating inner ring */}
          <motion.circle
            cx="250"
            cy="200"
            r="50"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner details */}
          <motion.path
            d="M250,160 L250,240 M210,200 L290,200"
            stroke="#10B981"
            strokeWidth="3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </g>
        
        {/* Input file icon */}
        <motion.g
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            damping: 12,
            delay: 1.2
          }}
        >
          <rect x="100" y="180" width="40" height="50" rx="5" fill="url(#fileGradient1)" />
          <rect x="112" y="195" width="16" height="2" fill="white" />
          <rect x="112" y="205" width="16" height="2" fill="white" />
          <rect x="112" y="215" width="16" height="2" fill="white" />
          <circle cx="105" cy="185" r="2" fill="white" />
        </motion.g>
        
        {/* Output file icon */}
        <motion.g
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            damping: 12,
            delay: 1.2
          }}
        >
          <rect x="360" y="180" width="40" height="50" rx="5" fill="url(#fileGradient2)" />
          <rect x="372" y="195" width="16" height="2" fill="white" />
          <rect x="372" y="205" width="16" height="2" fill="white" />
          <rect x="372" y="215" width="16" height="2" fill="white" />
          <circle cx="365" cy="185" r="2" fill="white" />
        </motion.g>
        
        {/* Animated arrows */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          {/* Input arrow */}
          <motion.path
            d="M150,200 L190,200"
            stroke="#8B5CF6"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{}}
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M185,195 L195,200 L185,205" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
          
          {/* Output arrow */}
          <motion.path
            d="M310,200 L350,200"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{}}
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <path d="M345,195 L355,200 L345,205" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        
        {/* Status indicators */}
        <motion.circle
          cx="250"
          cy="280"
          r="5"
          fill="#10B981"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2 }}
        />
        
        <motion.circle
          cx="270"
          cy="280"
          r="5"
          fill="#3B82F6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2.3 }}
        />
        
        <motion.circle
          cx="230"
          cy="280"
          r="5"
          fill="#8B5CF6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.7 }}
        />
      </motion.svg>
    </Box>
  );
};

export default ConverterModelSvg; 