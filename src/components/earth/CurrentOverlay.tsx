import { useEffect, useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState, SetAppState } from '../../types';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface CurrentOverlayProps {
  appState: AppState;
  setAppState: SetAppState;
}

// Custom colormap for current speed (0 to 1.5+ m/s)
function getSpeedColor(v: number): string {
  // Turbo-like colormap
  const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
  const colors = [
    [0.1, 0.1, 0.4], // dark blue
    [0.2, 0.5, 0.8], // light blue
    [0.2, 0.8, 0.5], // green
    [0.9, 0.9, 0.2], // yellow
    [0.9, 0.4, 0.1], // orange
    [0.7, 0.1, 0.1]  // red
  ];
  
  const t = Math.max(0, Math.min(1, v)) * (colors.length - 1);
  const idx = Math.floor(t);
  if (idx >= colors.length - 1) return `rgb(${colors[5][0]*255}, ${colors[5][1]*255}, ${colors[5][2]*255})`;
  
  const frac = t - idx;
  const c1 = colors[idx];
  const c2 = colors[idx + 1];
  
  const r = lerp(c1[0], c2[0], frac);
  const g = lerp(c1[1], c2[1], frac);
  const b = lerp(c1[2], c2[2], frac);
  
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// Cardinal direction string
function getDirectionString(u: number, v: number): string {
  // Math.atan2(y, x) -> atan2(v, u). 0 is East.
  // Oceanographic convention: direction FLOWING TO.
  const angle = Math.atan2(v, u) * (180 / Math.PI);
  const bearing = (450 - angle) % 360;
  
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor((bearing / 22.5) + 0.5);
  return `${directions[val % 16]} · ${Math.round(bearing)}°`;
}

export function CurrentOverlay({ appState, setAppState: _setAppState }: CurrentOverlayProps) {
  const { scientificVariable, currentPlaying, currentSpeed } = appState;
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoverInfo, setHoverInfo] = useState<{ point: THREE.Vector3, lat: number, lon: number, u: number, v: number, speed: number } | null>(null);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (scientificVariable !== 'currents' && !dataset) return;
    if (dataset) return;

    setLoading(true);
    fetch('/demo_currents.json')
      .then(res => res.json())
      .then(data => {
        setDataset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load current dataset.');
        setLoading(false);
      });
  }, [scientificVariable, dataset]);

  // Create Vector Field Texture & Geometry Data
  const { texture, instances, minU, maxU, minV, maxV } = useMemo(() => {
    if (!dataset || scientificVariable !== 'currents') return { texture: null, instances: null, minU: 0, maxU: 0, minV: 0, maxV: 0 };
    if (!dataset.variables || !dataset.variables.u || !dataset.variables.v) return { texture: null, instances: null, minU: 0, maxU: 0, minV: 0, maxV: 0 };
    if (!dataset.variables.u.data || !dataset.variables.v.data) return { texture: null, instances: null, minU: 0, maxU: 0, minV: 0, maxV: 0 };
    
    const width = dataset.dimensions.lon;
    const height = dataset.dimensions.lat;
    const uData = dataset.variables.u.data;
    const vData = dataset.variables.v.data;
    const arraySize = width * height;
    
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;
    let maxSpeed = 0;

    for (let i = 0; i < arraySize; i++) {
      const u = uData[i];
      const v = vData[i];
      if (u !== null && v !== null) {
        if (u < minU) minU = u;
        if (u > maxU) maxU = u;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
        const spd = Math.sqrt(u*u + v*v);
        if (spd > maxSpeed) maxSpeed = spd;
      }
    }

    const dataArray = new Uint8Array(arraySize * 4);
    const validIndices: number[] = [];

    for (let i = 0; i < arraySize; i++) {
      const u = uData[i];
      const v = vData[i];
      if (u === null || v === null) {
        dataArray[i * 4 + 0] = 0;
        dataArray[i * 4 + 1] = 0;
        dataArray[i * 4 + 2] = 0;
        dataArray[i * 4 + 3] = 0;
      } else {
        validIndices.push(i);
        const normU = (u - minU) / (maxU - minU);
        const normV = (v - minV) / (maxV - minV);
        dataArray[i * 4 + 0] = Math.floor(normU * 255);
        dataArray[i * 4 + 1] = Math.floor(normV * 255);
        dataArray[i * 4 + 2] = 0;
        dataArray[i * 4 + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(dataArray, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    // Generate instances
    const numInstances = 30000;
    const instanceUvs = new Float32Array(numInstances * 2);
    const instancePhases = new Float32Array(numInstances);
    
    for (let i = 0; i < numInstances; i++) {
      const randIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      const row = Math.floor(randIdx / width);
      const col = randIdx % width;
      
      const u_tex = (col + Math.random()) / width;
      const v_tex = (row + Math.random()) / height;
      
      instanceUvs[i * 2 + 0] = u_tex;
      instanceUvs[i * 2 + 1] = v_tex;
      instancePhases[i] = Math.random() * Math.PI * 2;
    }

    return { texture: tex, instances: { uvs: instanceUvs, phases: instancePhases, count: numInstances }, minU, maxU, minV, maxV };
  }, [dataset, scientificVariable]);

  const uniforms = useMemo(() => ({
    uData: { value: null as THREE.DataTexture | null },
    uMinUV: { value: new THREE.Vector2(0, 0) },
    uMaxUV: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uRadius: { value: 2.015 },
    uOpacity: { value: 0.0 }
  }), []);

  useFrame((_state, delta) => {
    if (scientificVariable !== 'currents') {
      uniforms.uOpacity.value = 0;
      return;
    }
    
    if (texture && instances) {
      uniforms.uData.value = texture;
      uniforms.uMinUV.value.set(minU, minV);
      uniforms.uMaxUV.value.set(maxU, maxV);
      uniforms.uOpacity.value = appState.scientificOpacity;
      
      if (currentPlaying) {
        uniforms.uTime.value += delta * currentSpeed;
      }
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (scientificVariable !== 'currents' || !dataset) return;
    if (!dataset.variables || !dataset.variables.u || !dataset.variables.v) return;
    if (!dataset.variables.u.data || !dataset.variables.v.data) return;
    
    if (e.uv) {
       const lon = e.uv.x * 360 - 180;
       const lat = e.uv.y * 180 - 90;
       
       const col = Math.floor(e.uv.x * 90);
       const row = Math.floor(e.uv.y * 45);
       
       const uData = dataset.variables.u.data;
       const vData = dataset.variables.v.data;
       const idx = row * 90 + col;
       
       const uVal = uData[idx];
       const vVal = vData[idx];
       
       if (uVal !== null && vVal !== null) {
          const speed = Math.sqrt(uVal*uVal + vVal*vVal);
          setHoverInfo({ point: e.point.clone(), lat, lon, u: uVal, v: vVal, speed });
       } else {
          setHoverInfo(null);
       }
    }
  };

  if (scientificVariable !== 'currents' && (!materialRef.current || uniforms.uOpacity.value < 0.01)) {
    return null;
  }

  const particleGeom = new THREE.BufferGeometry();
  // Thin arrow / chevron
  const vertices = new Float32Array([
    -0.003, -0.015, 0,
     0.003, -0.015, 0,
     0.000,  0.02, 0
  ]);
  particleGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  return (
    <>
      <mesh onPointerMove={handlePointerMove} onPointerOut={() => setHoverInfo(null)} visible={scientificVariable === 'currents'}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {instances && (
        <instancedMesh ref={meshRef} args={[particleGeom, undefined, instances.count]}>
          <instancedBufferAttribute attach="attributes-instanceUv" args={[instances.uvs, 2]} />
          <instancedBufferAttribute attach="attributes-instancePhase" args={[instances.phases, 1]} />
          <shaderMaterial
            ref={materialRef}
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={uniforms}
            vertexShader={`
              attribute vec2 instanceUv;
              attribute float instancePhase;
              
              uniform sampler2D uData;
              uniform vec2 uMinUV;
              uniform vec2 uMaxUV;
              uniform float uRadius;
              uniform float uTime;
              
              varying float vSpeed;
              varying float vAlpha;
              
              #define PI 3.14159265359

              void main() {
                vec4 texColor = texture2D(uData, instanceUv);
                
                if (texColor.a < 0.5) {
                   gl_Position = vec4(0.0);
                   vAlpha = 0.0;
                   return;
                }
                
                float u = mix(uMinUV.x, uMaxUV.x, texColor.r);
                float v = mix(uMinUV.y, uMaxUV.y, texColor.g);
                
                float speed = length(vec2(u, v));
                vSpeed = speed;
                
                // Pulse alpha to create a flowing effect, faster current = faster pulse
                vAlpha = (sin(uTime * max(1.0, speed * 4.0) + instancePhase) + 1.0) * 0.5;

                float scale = 0.5 + speed * 1.5;
                vec3 pos = position * scale;
                
                float angle = atan(v, u) - PI/2.0;
                
                float ca = cos(angle);
                float sa = sin(angle);
                
                vec3 rotatedPos = vec3(
                   pos.x * ca - pos.y * sa,
                   pos.x * sa + pos.y * ca,
                   0.0
                );
                
                float lon = (instanceUv.x * 360.0 - 180.0) * (PI / 180.0);
                float lat = (instanceUv.y * 180.0 - 90.0) * (PI / 180.0);
                
                // Normal is correct for threejs sphere
                vec3 N = normalize(vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon)));
                
                // T points East. Longitude derivative
                vec3 T = normalize(vec3(cos(lon), 0.0, -sin(lon)));
                
                // B points North. 
                vec3 B = cross(N, T);
                
                // Apply rotation frame: X is East (T), Y is North (B)
                vec3 finalOffset = T * rotatedPos.x + B * rotatedPos.y;
                
                vec3 finalPos = N * uRadius + finalOffset;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uOpacity;
              varying float vSpeed;
              varying float vAlpha;
              
              vec3 turbo(float x) {
                const vec4 c0 = vec4(0.1, 0.1, 0.4, 1.0);
                const vec4 c1 = vec4(0.2, 0.5, 0.8, 1.0);
                const vec4 c2 = vec4(0.2, 0.8, 0.5, 1.0);
                const vec4 c3 = vec4(0.9, 0.9, 0.2, 1.0);
                const vec4 c4 = vec4(0.9, 0.4, 0.1, 1.0);
                const vec4 c5 = vec4(0.7, 0.1, 0.1, 1.0);
                
                float t = clamp(x, 0.0, 1.0) * 5.0;
                float idx = floor(t);
                float f = t - idx;
                
                if (idx < 1.0) return mix(c0.rgb, c1.rgb, f);
                if (idx < 2.0) return mix(c1.rgb, c2.rgb, f);
                if (idx < 3.0) return mix(c2.rgb, c3.rgb, f);
                if (idx < 4.0) return mix(c3.rgb, c4.rgb, f);
                return mix(c4.rgb, c5.rgb, f);
              }

              void main() {
                if (vAlpha < 0.01) discard;
                
                float normSpeed = vSpeed / 1.5;
                vec3 color = turbo(normSpeed);
                
                gl_FragColor = vec4(color, uOpacity * vAlpha);
              }
            `}
          />
        </instancedMesh>
      )}

      {scientificVariable === 'currents' && (loading || error) && (
        <Html center>
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-white/10 text-center pointer-events-none">
             {loading && <div className="text-cyan-400 text-xs tracking-widest uppercase animate-pulse">Loading Current Data...</div>}
             {error && <div className="text-red-400 text-xs tracking-widest uppercase">{error}</div>}
           </div>
        </Html>
      )}

      {hoverInfo && scientificVariable === 'currents' && (
        <Html position={hoverInfo.point} style={{ pointerEvents: 'none' }}>
           <div className="bg-[#020408]/90 border border-white/20 p-2 rounded text-xs text-white shadow-xl backdrop-blur-md w-36 translate-x-2 -translate-y-2 pointer-events-none">
              <div className="text-cyan-400 font-bold mb-1 border-b border-white/10 pb-1">
                 {Math.abs(hoverInfo.lat).toFixed(1)}° {hoverInfo.lat >= 0 ? 'N' : 'S'}<br/>
                 {Math.abs(hoverInfo.lon).toFixed(1)}° {hoverInfo.lon >= 0 ? 'E' : 'W'}
              </div>
              <div className="text-white/80">
                 OCEAN CURRENTS<br/>
                 <span 
                   className="font-bold drop-shadow-md text-sm"
                   style={{ color: getSpeedColor(hoverInfo.speed / 1.5) }}
                 >
                   {hoverInfo.speed.toFixed(2)} m/s
                 </span>
              </div>
              <div className="text-white/60 font-bold mt-1 tracking-widest">
                 {getDirectionString(hoverInfo.u, hoverInfo.v)}
              </div>
              <div className="text-white/50 text-[9px] mt-1 uppercase tracking-widest">
                 Depth: Surface
              </div>
           </div>
        </Html>
      )}
    </>
  );
}
