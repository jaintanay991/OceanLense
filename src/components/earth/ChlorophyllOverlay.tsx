import { useEffect, useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState, SetAppState } from '../../types';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface ChlorophyllOverlayProps {
  appState: AppState;
  setAppState: SetAppState;
}

export function ChlorophyllOverlay({ appState, setAppState }: ChlorophyllOverlayProps) {
  const { scientificVariable } = appState;
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoverInfo, setHoverInfo] = useState<{ point: THREE.Vector3, lat: number, lon: number, val: number | null } | null>(null);

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (scientificVariable !== 'chlorophyll') return; 
    if (dataset) return; 

    setLoading(true);
    fetch('/chlorophyll.json')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setDataset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load chlorophyll dataset.');
        setLoading(false);
      });
  }, [scientificVariable, dataset]);

  const { texture, rawDataArray, minVal, maxVal, bounds } = useMemo(() => {
    if (!dataset || !dataset.table) {
        return { texture: null, rawDataArray: null, minVal: 0, maxVal: 0, bounds: { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0, width: 0, height: 0 } };
    }
    
    const lats = [...new Set(dataset.table.rows.map((r: any) => r[1]))].sort((a: any, b: any) => a - b);
    const lons = [...new Set(dataset.table.rows.map((r: any) => r[2]))].sort((a: any, b: any) => a - b);
    
    const width = lons.length;
    const height = lats.length;
    const arraySize = width * height;
    const dataArray = new Uint8Array(arraySize * 4);
    const rawDataArr = new Float32Array(arraySize).fill(-1);
    
    const latMap = new Map(lats.map((l, i) => [l, i]));
    const lonMap = new Map(lons.map((l, i) => [l, i]));
    
    let actualMin = Infinity;
    let actualMax = -Infinity;

    for (const row of dataset.table.rows) {
        const val = row[3];
        if (val !== null && val > 0) {
            if (val < actualMin) actualMin = val;
            if (val > actualMax) actualMax = val;
        }
    }

    const logMin = Math.log10(Math.max(0.01, actualMin));
    const logMax = Math.log10(actualMax);

    for (const row of dataset.table.rows) {
       const latIdx = latMap.get(row[1]) as number;
       const lonIdx = lonMap.get(row[2]) as number;
       const val = row[3];
       const idx = latIdx * width + lonIdx;
       
       if (val !== null && val > 0) {
          rawDataArr[idx] = val;
          const logVal = Math.log10(val);
          const clamped = Math.max(logMin, Math.min(logMax, logVal));
          const normalized = (clamped - logMin) / (logMax - logMin);
          
          dataArray[idx * 4 + 0] = Math.floor(normalized * 255);
          dataArray[idx * 4 + 1] = 0;
          dataArray[idx * 4 + 2] = 0;
          dataArray[idx * 4 + 3] = 255;
       } else {
          dataArray[idx * 4 + 3] = 0;
       }
    }

    const tex = new THREE.DataTexture(dataArray, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    return { 
        texture: tex, 
        rawDataArray: rawDataArr, 
        minVal: actualMin, 
        maxVal: actualMax,
        bounds: {
            minLat: Number(lats[0]),
            maxLat: Number(lats[lats.length - 1]),
            minLon: Number(lons[0]),
            maxLon: Number(lons[lons.length - 1]),
            width,
            height
        }
    };
  }, [dataset]);

  useEffect(() => {
    if (texture) {
      setAppState(prev => {
        if (prev.scientificRange?.min !== minVal || prev.scientificRange?.max !== maxVal) {
          return { ...prev, scientificRange: { min: minVal, max: maxVal } };
        }
        return prev;
      });
    } else {
      setAppState(prev => prev.scientificRange ? { ...prev, scientificRange: null } : prev);
    }
  }, [texture, setAppState, minVal, maxVal]);

  useEffect(() => {
    if (appState.isModelVsObs) {
      setHoverInfo(null);
    window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: null }));
    }
  }, [appState.isModelVsObs]);

  const uniforms = useMemo(() => ({
    uData: { value: null as THREE.DataTexture | null },
    uOpacity: { value: 0.0 },
    uBounds: { value: new THREE.Vector4(0, 0, 0, 0) }
  }), []);

  useFrame(() => {
    if (materialRef.current) {
      if (scientificVariable === 'chlorophyll' && texture && bounds) {
        uniforms.uData.value = texture;
        uniforms.uOpacity.value = appState.isModelVsObs ? 0.0 : appState.scientificOpacity;
        uniforms.uBounds.value.set(Number(bounds.minLon), Number(bounds.minLat), Number(bounds.maxLon), Number(bounds.maxLat));
      } else {
        uniforms.uOpacity.value = 0.0;
      }
    }
  });


  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (scientificVariable !== 'chlorophyll' || !dataset || appState.isModelVsObs || !rawDataArray || !bounds) return;
    
    if (e.uv) {
       const lon = e.uv.x * 360 - 180;
       const lat = e.uv.y * 180 - 90;
       
       if (lat >= bounds.minLat && lat <= bounds.maxLat && lon >= bounds.minLon && lon <= bounds.maxLon) {
           const u = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon);
           const v = (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
           
           const col = Math.min(Math.floor(u * bounds.width), bounds.width - 1);
           const row = Math.min(Math.floor(v * bounds.height), bounds.height - 1);
           
           const idx = row * bounds.width + col;
           const val = rawDataArray[idx];
           
           if (val !== undefined && val > 0) {
              setHoverInfo({ point: e.point.clone(), lat, lon, val });
              window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: { variable: 'chlorophyll', lat, lon, val, depth: 'Surface', time: '2023-01-01T00:00:00Z' } }));
           } else {
              setHoverInfo({ point: e.point.clone(), lat, lon, val: null });
              window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: { variable: 'chlorophyll', lat, lon, val: null } }));
           }
       } else {
           setHoverInfo({ point: e.point.clone(), lat, lon, val: null });
              window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: { variable: 'chlorophyll', lat, lon, val: null } }));
       }
    }
  };

  const handlePointerOut = () => {
    setHoverInfo(null);
    window.dispatchEvent(new CustomEvent('oceanDataHover', { detail: null }));
  };

  return (
    <>
      <mesh visible={scientificVariable === 'chlorophyll'} onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[2.011, 64, 64]} />
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
            uniform float uOpacity;
            uniform vec4 uBounds; // x=minLon, y=minLat, z=maxLon, w=maxLat
            varying vec2 vUv;

            vec3 chloroColor(float v) {
                if (v < 0.25) return mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 1.0, 1.0), v * 4.0);
                if (v < 0.5) return mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), (v - 0.25) * 4.0);
                if (v < 0.75) return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (v - 0.5) * 4.0);
                return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (v - 0.75) * 4.0);
            }
            
            void main() {
              float lat = vUv.y * 180.0 - 90.0;
              float lon = vUv.x * 360.0 - 180.0;
              
              if (lat < uBounds.y || lat > uBounds.w || lon < uBounds.x || lon > uBounds.z) {
                 discard;
              }
              
              float u = (lon - uBounds.x) / (uBounds.z - uBounds.x);
              float v = (lat - uBounds.y) / (uBounds.w - uBounds.y);
              
              vec4 texColor = texture2D(uData, vec2(u, v));
              
              float alpha = smoothstep(0.1, 0.5, texColor.a);
              if (alpha < 0.01) {
                 discard;
              }
              
              vec3 color = chloroColor(texColor.r);
              gl_FragColor = vec4(color, alpha * uOpacity);
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

      {hoverInfo && scientificVariable === 'chlorophyll' && !error && !loading && (
        <Html position={hoverInfo.point} style={{ pointerEvents: 'none' }}>
           <div className="bg-[#020408]/90 border border-white/20 p-2 rounded text-xs text-white shadow-xl backdrop-blur-md w-32 translate-x-2 -translate-y-2 pointer-events-none">
              <div className="text-cyan-400 font-bold mb-1 border-b border-white/10 pb-1">
                 {Math.abs(hoverInfo.lat).toFixed(4)}&deg; {hoverInfo.lat >= 0 ? 'N' : 'S'}<br/>
                 {Math.abs(hoverInfo.lon).toFixed(4)}&deg; {hoverInfo.lon >= 0 ? 'E' : 'W'}
              </div>
              <div className="text-white/80">
                 Chlorophyll<br/>
                 <span 
                   className="font-bold drop-shadow-md text-green-400"
                 >
                   {hoverInfo.val !== null ? `${hoverInfo.val.toFixed(2)} mg/m³` : 'No Data'}
                 </span>
              </div>
              <div className="text-white/50 text-[9px] mt-1 uppercase tracking-widest">
                 Depth: Surface<br/>
                 Source: Copernicus Marine
              </div>
           </div>
        </Html>
      )}
    </>
  );
}


