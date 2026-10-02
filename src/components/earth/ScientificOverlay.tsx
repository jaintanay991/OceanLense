import { useEffect, useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState, SetAppState } from '../../types';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

// Mirror GLSL colormaps in JavaScript for UI consistency (SINGLE SOURCE OF TRUTH math)
function getJetColor(v: number): string {
  const r = Math.max(0, Math.min(1, 1.5 - Math.abs(4.0 * v - 3.0)));
  const g = Math.max(0, Math.min(1, 1.5 - Math.abs(4.0 * v - 2.0)));
  const b = Math.max(0, Math.min(1, 1.5 - Math.abs(4.0 * v - 1.0)));
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function getHalineColor(v: number): string {
  const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
  const m1_r = lerp(0.0, 0.8, v);
  const m1_g = lerp(0.5, 0.9, v);
  const m1_b = lerp(0.5, 0.2, v);
  
  const r = lerp(0.2, m1_r, v);
  const g = lerp(0.0, m1_g, v);
  const b = lerp(0.4, m1_b, v);
  
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function getScientificColor(variable: 'temperature' | 'salinity', val: number, min: number, max: number): string {
  if (min === max) return '#ffffff';
  const normalized = Math.max(0, Math.min(1, (val - min) / (max - min)));
  return variable === 'temperature' ? getJetColor(normalized) : getHalineColor(normalized);
}

interface ScientificOverlayProps {
  appState: AppState;
  setAppState: SetAppState;
}

export function ScientificOverlay({ appState, setAppState }: ScientificOverlayProps) {
  const { scientificVariable, scientificDepth } = appState;
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoverInfo, setHoverInfo] = useState<{ point: THREE.Vector3, lat: number, lon: number, val: number } | null>(null);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (!scientificVariable && !dataset) return; // Don't fetch until needed
    if (scientificVariable === 'chlorophyll') return; // Do not fetch anything for chlorophyll yet
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
    if (!dataset || !scientificVariable || scientificVariable === 'currents' || scientificVariable === 'chlorophyll') return null;
    
    const variableData = dataset.variables[scientificVariable];
    if (!variableData || !variableData.data) return null;

    const rawData = variableData.data[scientificDepth.toString()];
    if (!rawData) return null;

    const width = 90;
    const height = 45;
    const arraySize = width * height;
    const dataArray = new Uint8Array(arraySize * 4);
    
    let minVal = Infinity;
    let maxVal = -Infinity;

    // Only process the actual data grid, ignore the appended coordinate arrays
    for (let i = 0; i < arraySize; i++) {
      const val = rawData[i];
      if (val !== null && val !== undefined && val > -100) {
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
    }

    // Pack into RGBA
    for (let i = 0; i < arraySize; i++) {
      const val = rawData[i];
      if (val === null || val === undefined || val < -100) {
        dataArray[i * 4 + 0] = 0;
        dataArray[i * 4 + 1] = 0;
        dataArray[i * 4 + 2] = 0;
        dataArray[i * 4 + 3] = 0; // Alpha 0 = missing
      } else {
        const normalized = (val - minVal) / (maxVal - minVal);
        dataArray[i * 4 + 0] = Math.floor(normalized * 255);
        dataArray[i * 4 + 1] = 0;
        dataArray[i * 4 + 2] = 0;
        dataArray[i * 4 + 3] = 255; // Alpha 255 = valid
      }
    }

    const tex = new THREE.DataTexture(dataArray, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    return { tex, minVal, maxVal };
  }, [dataset, scientificVariable, scientificDepth]);

  useEffect(() => {
    if (texture) {
      setAppState(prev => {
        if (prev.scientificRange?.min !== texture.minVal || prev.scientificRange?.max !== texture.maxVal) {
          return { ...prev, scientificRange: { min: texture.minVal, max: texture.maxVal } };
        }
        return prev;
      });
    } else {
      setAppState(prev => prev.scientificRange ? { ...prev, scientificRange: null } : prev);
    }
  }, [texture, setAppState]);

  useEffect(() => {
    if (appState.isModelVsObs) {
      setHoverInfo(null);
          window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: null }));
    }
  }, [appState.isModelVsObs]);

  const uniforms = useMemo(() => ({
    uData: { value: null as THREE.DataTexture | null },
    uVariableType: { value: 0.0 },
    uOpacity: { value: 0.0 }
  }), []);

  useFrame(() => {
    if (materialRef.current) {
      if (scientificVariable && texture) {
        uniforms.uData.value = texture.tex;
        uniforms.uVariableType.value = scientificVariable === 'temperature' ? 1.0 : (scientificVariable === 'chlorophyll' ? 2.0 : 0.0);
        // Direct assignment to fix lerp bug and ensure UI slider is perfectly synced
        uniforms.uOpacity.value = appState.isModelVsObs ? 0.0 : appState.scientificOpacity;
      } else {
        uniforms.uOpacity.value = 0.0;
      }
    }
  });

  if (!scientificVariable && (!materialRef.current || uniforms.uOpacity.value < 0.01)) {
    return null;
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!scientificVariable || scientificVariable === 'currents' || !dataset || appState.isModelVsObs) return;
    
    if (e.uv) {
       // Convert spherical UV to geographic coordinates matching the texture map
       const lon = e.uv.x * 360 - 180;
       const lat = e.uv.y * 180 - 90;
       
       // Calculate grid indices
       const col = Math.floor(e.uv.x * 90);
       const row = Math.floor(e.uv.y * 45);
       
       const variableData = dataset.variables[scientificVariable];
       if (!variableData || !variableData.data) return;

       const rawData = variableData.data[scientificDepth.toString()];
       if (!rawData) return;
       
       const val = rawData[row * 90 + col];
       
       if (val !== null && val !== undefined && val > -100) {
          setHoverInfo({ point: e.point.clone(), lat, lon, val });
          window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: { variable: scientificVariable, lat, lon, val, depth: scientificDepth, time: 'Decadal Annual Climatology' } }));
       } else {
          setHoverInfo(null);
          window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: null }));
       }
    }
  };

  const handlePointerOut = () => {
    setHoverInfo(null);
          window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: null }));
  };

  return (
    <>
      <mesh onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
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
            uniform float uVariableType;
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
              vec2 sampleUv = vUv;
              vec4 texColor = texture2D(uData, sampleUv);
              
              // Smoothly fade out the edges of the missing data to prevent hard jagged lines
              float alpha = smoothstep(0.1, 0.5, texColor.a);
              
              if (alpha < 0.01) {
                 discard;
              }

              float normalized = texColor.r;
              
              // Apply final scientific colormap
              vec3 color = mix(haline(normalized), jet(normalized), uIsTemperature);

              gl_FragColor = vec4(color, uOpacity * alpha);
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

      {/* Hover Tooltip */}
      {hoverInfo && texture && scientificVariable && (
        <Html position={hoverInfo.point} style={{ pointerEvents: 'none' }}>
           <div className="bg-[#020408]/90 border border-white/20 p-2 rounded text-xs text-white shadow-xl backdrop-blur-md w-32 translate-x-2 -translate-y-2 pointer-events-none">
              <div className="text-cyan-400 font-bold mb-1 border-b border-white/10 pb-1">
                 {Math.abs(hoverInfo.lat).toFixed(1)}° {hoverInfo.lat >= 0 ? 'N' : 'S'}<br/>
                 {Math.abs(hoverInfo.lon).toFixed(1)}° {hoverInfo.lon >= 0 ? 'E' : 'W'}
              </div>
              <div className="text-white/80">
                 {scientificVariable === 'temperature' ? 'Temperature' : 'Salinity'}<br/>
                 <span 
                   className="font-bold drop-shadow-md"
                   style={{ color: getScientificColor(scientificVariable as 'temperature' | 'salinity', hoverInfo.val, texture.minVal, texture.maxVal) }}
                 >
                   {hoverInfo.val.toFixed(1)} {scientificVariable === 'temperature' ? '°C' : 'PSU'}
                 </span>
              </div>
              <div className="text-white/50 text-[9px] mt-1 uppercase tracking-widest">
                 Depth: {scientificDepth === 0 ? 'Surface' : `${scientificDepth}m`}
              </div>
           </div>
        </Html>
      )}
    </>
  );
}

