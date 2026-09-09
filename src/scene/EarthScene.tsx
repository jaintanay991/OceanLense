import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Earth } from '../components/earth/Earth';
import { Atmosphere } from '../components/earth/Atmosphere';
import { Clouds } from '../components/earth/Clouds';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface EarthSceneProps {
  cinematicMode: boolean;
  resetTrigger: number;
}

export function EarthScene({ cinematicMode, resetTrigger }: EarthSceneProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastResetTrigger = useRef(resetTrigger);
  
  useFrame((state, delta) => {
    // Handle Reset
    if (resetTrigger !== lastResetTrigger.current) {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.set(0, 0, 0);
      }
      state.camera.position.set(0, 0, 5.5);
      state.camera.lookAt(0, 0, 0);
      lastResetTrigger.current = resetTrigger;
    }

    // Cinematic auto-rotation
    if (cinematicMode && earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.05;
    } else if (earthGroupRef.current) {
      // Subtle rotation even in normal mode
      earthGroupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <>
      <color attach="background" args={['#020408']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.8} color="#e0e8f0" />
      <hemisphereLight args={['#ffffff', '#0a1a2a', 1.0]} />
      
      {/* Main sun light */}
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={3.5} 
        color="#ffffff" 
      />
      {/* Back/Fill lights to keep the shadow side highly readable */}
      <directionalLight 
        position={[-5, 3, -5]} 
        intensity={1.5} 
        color="#8bb0d0" 
      />
      <directionalLight 
        position={[0, -5, 0]} 
        intensity={0.8} 
        color="#2a3a5a" 
      />

      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />

      <group ref={earthGroupRef}>
        <Earth />
        <Clouds />
        <Atmosphere />
      </group>

      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.4}
        rotateSpeed={0.5}
        minDistance={2.5}
        maxDistance={10}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}
