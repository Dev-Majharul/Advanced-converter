import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// A fallback model when no 3D model is available
export function SimpleModel(props) {
  const meshRef = useRef();
  
  // Animation - floating and rotating effect
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      // Add a gentle floating effect
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group {...props}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          emissive="#4F46E5"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Main floating model component with effects
const FloatingModel = ({ position = [0, 0, 0], size = 1, color = '#8B5CF6', speed = 1 }) => {
  const mesh = useRef();

  // Animation for floating effect
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Sine wave movement for floating up/down
    mesh.current.position.y = position[1] + Math.sin(time * 0.5 * speed) * 0.2;
    
    // Gentle rotation
    mesh.current.rotation.x = Math.sin(time * 0.3 * speed) * 0.2;
    mesh.current.rotation.z = Math.sin(time * 0.2 * speed) * 0.2;
    mesh.current.rotation.y += 0.003 * speed;
  });

  return (
    <mesh ref={mesh} position={position}>
      <icosahedronGeometry args={[size, 4]} />
      <MeshDistortMaterial
        color={color}
        distort={0.3}
        speed={3}
        roughness={0.4}
        metalness={0.7}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

export default FloatingModel; 