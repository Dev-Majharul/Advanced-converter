import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Box, CircularProgress } from '@mui/material';
import ParticleBackground from './ParticleBackground';

const SceneContainer = ({ 
  children, 
  height = '400px', 
  controls = true,
  particles = true,
  bgColor = '#050816',
  showEnvironment = true,
  cameraPosition = [0, 0, 5],
  fov = 45,
  cameraRotation = null
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height,
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        background: `linear-gradient(to bottom, ${bgColor}, #000000)`,
      }}
    >
      <Suspense fallback={
        <Box 
          sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      }>
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          {/* Camera setup */}
          <PerspectiveCamera 
            makeDefault 
            position={cameraPosition} 
            fov={fov}
            rotation={cameraRotation}
          />
          
          {/* Ambient lighting */}
          <ambientLight intensity={0.3} />
          
          {/* Main directional light */}
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024}
          />
          
          {/* Fill light from opposite direction */}
          <directionalLight 
            position={[-5, -5, -5]} 
            intensity={0.3} 
          />
          
          {/* Optional particle background */}
          {particles && <ParticleBackground count={300} />}
          
          {/* Optional HDRI environment */}
          {showEnvironment && <Environment preset="warehouse" />}
          
          {/* Main content */}
          {children}
          
          {/* Optional orbit controls */}
          {controls && <OrbitControls enableZoom={false} enablePan={false} />}
        </Canvas>
        
        {/* Overlay gradient for top and bottom edges */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0))',
            pointerEvents: 'none',
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0))',
            pointerEvents: 'none',
          }}
        />
      </Suspense>
    </Box>
  );
};

export default SceneContainer; 