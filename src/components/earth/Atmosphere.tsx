import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 color;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() {
  float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
  gl_FragColor = vec4(color, 1.0) * intensity * 1.2;
}
`;

export function Atmosphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    color: { value: new THREE.Color(0x3a82f8) } // Deep sky blue
  }), []);

  return (
    <mesh ref={meshRef}>
      {/* Slightly larger to create the rim */}
      <sphereGeometry args={[2.08, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
