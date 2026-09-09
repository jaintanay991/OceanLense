import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load high-quality textures
  const [colorMap, normalMap, specularMap] = useTexture([
    '/textures/earth/earth_color.jpg',
    '/textures/earth/earth_normal.jpg',
    '/textures/earth/earth_specular.jpg',
  ]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial
        map={colorMap}
        normalMap={normalMap}
        specularMap={specularMap}
        normalScale={new THREE.Vector2(0.8, 0.8)}
        specular={new THREE.Color(0x222222)}
        shininess={15}
      />
    </mesh>
  );
}
