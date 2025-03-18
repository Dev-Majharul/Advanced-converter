import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleBackground = ({ count = 500, color = '#8B5CF6', secondary = '#4F46E5' }) => {
  const mesh = useRef();
  const light = useRef();
  
  // Generate random positions for particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 25;
      
      // Size variation
      const size = Math.random() * 0.5 + 0.1;
      
      temp.push({ x, y, z, size });
    }
    return temp;
  }, [count]);
  
  // Create geometries and materials
  const [geometry, material, secondaryMaterial] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Positions attribute
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    const color1 = new THREE.Color(color);
    const color2 = new THREE.Color(secondary);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = particles[i].x;
      positions[i3 + 1] = particles[i].y;
      positions[i3 + 2] = particles[i].z;
      
      sizes[i] = particles[i].size;
      
      // Alternate colors
      const particleColor = i % 2 === 0 ? color1 : color2;
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const mat = new THREE.PointsMaterial({
      size: 0.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
    });
    
    const secondaryMat = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      vertexColors: true,
    });
    
    return [geo, mat, secondaryMat];
  }, [count, color, secondary, particles]);
  
  // Animate particles
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire particle system slowly
    if (mesh.current) {
      mesh.current.rotation.x = time * 0.05;
      mesh.current.rotation.y = time * 0.06;
    }
    
    // Move the light source to create dynamic shadows
    if (light.current) {
      light.current.position.x = Math.sin(time * 0.2) * 15;
      light.current.position.y = Math.cos(time * 0.2) * 15;
    }
    
    // Update individual particle sizes
    const sizes = geometry.attributes.size.array;
    
    for (let i = 0; i < count; i++) {
      // Make particles pulse at different rates
      sizes[i] = particles[i].size * (1 + 0.3 * Math.sin(time + i));
    }
    
    geometry.attributes.size.needsUpdate = true;
  });
  
  return (
    <group>
      {/* Main particles */}
      <points ref={mesh} geometry={geometry} material={material} />
      
      {/* Secondary smaller particles */}
      <points geometry={geometry} material={secondaryMaterial} position={[0, 0, 2]} />
      
      {/* Dynamic light source */}
      <pointLight
        ref={light}
        distance={20}
        intensity={2}
        color={color}
      />
    </group>
  );
};

export default ParticleBackground; 