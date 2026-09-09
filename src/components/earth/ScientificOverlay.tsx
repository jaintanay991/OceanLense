import { useEffect, useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState } from '../../types';
import { Html } from '@react-three/drei';

interface ScientificOverlayProps {
  appState: AppState;
}

export function ScientificOverlay({ appState }: ScientificOverlayProps) {
  const { scientificVariable, scientificDepth } = appState;
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (!scientificVariable && !dataset) return; // Don't fetch until needed
    if (dataset) return; // Already fetched

    setLoading(true);
    fetch('/woa23_subset.json')
      .then(res => res.json())
      .then(data => {
        setDataset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load scientific dataset.');
        setLoading(false);
      });
  }, [scientificVariable]);

  const texture = useMemo(() => {
    if (!dataset || !scientificVariable) return null;
    
    const rawData = dataset.variables[scientificVariable].data[scientificDepth.toString()];
    if (!rawData) return null;

    const width = 90;
    const height = 45;
    const dataArray = new Float32Array(width * height);
    
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let i = 0; i < rawData.length; i++) {
      const val = rawData[i];
      if (val === null || val === undefined) {
        dataArray[i] = -999.0;
      } else {
        dataArray[i] = val;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
    }

    const tex = new THREE.DataTexture(dataArray, width, height, THREE.RedFormat, THREE.FloatType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    return { tex, minVal, maxVal };
  }, [dataset, scientificVariable, scientificDepth]);

  const uniforms = useMemo(() => ({
    uData: { value: null as THREE.DataTexture | null },
    uMin: { value: 0 },
    uMax: { value: 35 },
    uIsTemperature: { value: 1.0 },
    uOpacity: { value: 0.0 }
  }), []);

  useFrame((_state, delta) => {
    if (materialRef.current) {
      let targetOpacity = 0.0;
      
      if (scientificVariable && texture) {
        targetOpacity = 0.85; // highly visible
        uniforms.uData.value = texture.tex;
        uniforms.uMin.value = texture.minVal;
        uniforms.uMax.value = texture.maxVal;
        uniforms.uIsTemperature.value = scientificVariable === 'temperature' ? 1.0 : 0.0;
      }
      
      uniforms.uOpacity.value = THREE.MathUtils.lerp(uniforms.uOpacity.value, targetOpacity, delta * 4.0);
    }
  });

  if (!scientificVariable && (!materialRef.current || uniforms.uOpacity.value < 0.01)) {
    return null;
  }

  return (
    <>
      <mesh>
        <sphereGeometry args={[2.01, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          transparent={true}
          depthWrite={false}
          blending={THREE.NormalBlending}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D uData;
            uniform float uMin;
            uniform float uMax;
            uniform float uIsTemperature;
            uniform float uOpacity;
            varying vec2 vUv;

            // Jet colormap for temperature
            vec3 jet(float v) {
                vec3 c;
                c.r = clamp(1.5 - abs(4.0 * v - 3.0), 0.0, 1.0);
                c.g = clamp(1.5 - abs(4.0 * v - 2.0), 0.0, 1.0);
                c.b = clamp(1.5 - abs(4.0 * v - 1.0), 0.0, 1.0);
                return c;
            }

            // Haline colormap (viridis-like) for salinity
            vec3 haline(float v) {
                return mix(vec3(0.2, 0.0, 0.4), mix(vec3(0.0, 0.5, 0.5), vec3(0.8, 0.9, 0.2), v), v);
            }

            void main() {
              float val = texture2D(uData, vUv).r;
              if (val < -900.0) {
                 discard; // land or missing data
              }

              float normalized = clamp((val - uMin) / (uMax - uMin), 0.0, 1.0);
              vec3 color = mix(haline(normalized), jet(normalized), uIsTemperature);

              gl_FragColor = vec4(color, uOpacity);
            }
          `}
        />
      </mesh>
      
      {/* HTML Error / Loading Overlay bound to 3D center */}
      {scientificVariable && (loading || error) && (
        <Html center>
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-white/10 text-center pointer-events-none">
             {loading && <div className="text-cyan-400 text-xs tracking-widest uppercase animate-pulse">Loading Scientific Data...</div>}
             {error && <div className="text-red-400 text-xs tracking-widest uppercase">{error}</div>}
           </div>
        </Html>
      )}
    </>
  );
}
