import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Clouds() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const cloudsMap = useTexture('/textures/earth/earth_clouds.png');

  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Clouds rotate slightly faster/independently of the Earth
      meshRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Slightly larger than the Earth (radius 2) */}
      <sphereGeometry args={[2.02, 64, 64]} />
      <meshPhongMaterial
        map={cloudsMap}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
