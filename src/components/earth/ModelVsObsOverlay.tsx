import { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AppState, SetAppState } from '../../types';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface ModelVsObsOverlayProps {
  appState: AppState;
  setAppState: SetAppState;
}

const MARKER_GEOMETRY = new THREE.DodecahedronGeometry(0.015, 0);

function getDiffColor(diff: number, maxDiff: number): THREE.Color {
  const norm = Math.max(-1, Math.min(1, diff / maxDiff));
  if (norm < 0) {
    // Blue for negative (Obs < Model)
    return new THREE.Color(1 + norm, 1 + norm, 1);
  } else {
    // Red for positive (Obs > Model)
    return new THREE.Color(1, 1 - norm, 1 - norm);
  }
}

export function ModelVsObsOverlay({ appState }: ModelVsObsOverlayProps) {
  const { isModelVsObs, scientificVariable, scientificDepth, activeObservations } = appState;
  
  const [modelDataset, setModelDataset] = useState<any>(null);
  const [obsDataset, setObsDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoveredData, setHoveredData] = useState<any>(null);

  useEffect(() => {
    if (!isModelVsObs) return;
    if (modelDataset && obsDataset) return;

    setLoading(true);
    Promise.all([
      fetch('/woa23_subset.json').then(res => res.json()),
      fetch('/demo_observations.json').then(res => res.json())
    ])
    .then(([model, obs]) => {
      setModelDataset(model);
      setObsDataset(obs);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load datasets for comparison.');
      setLoading(false);
    });
  }, [isModelVsObs, modelDataset, obsDataset]);

  const { matrices, colors, comparisons } = useMemo(() => {
    if (!modelDataset || !obsDataset || !isModelVsObs) return { matrices: null, colors: null, stats: null, comparisons: [] };
    if (!scientificVariable || (scientificVariable !== 'temperature' && scientificVariable !== 'salinity')) return { matrices: null, colors: null, stats: null, comparisons: [] };
    if (activeObservations.length === 0) return { matrices: null, colors: null, stats: null, comparisons: [] };

    const modelVarData = modelDataset.variables[scientificVariable]?.data[scientificDepth.toString()];
    if (!modelVarData) return { matrices: null, colors: null, stats: null, comparisons: [] };

    const validComparisons: any[] = [];
    let sumDiff = 0;
    let sumAbsDiff = 0;
    let sumSqDiff = 0;

    const radius = 2.03; 

    // Find max difference for coloring
    let maxDiff = scientificVariable === 'temperature' ? 2.0 : 0.5;

    obsDataset.observations.forEach((obs: any) => {
      if (!activeObservations.includes(obs.type)) return;

      // Extract obs value at depth
      let obsVal = null;
      if (obs.profile) {
        const p = obs.profile.find((dp: any) => dp.depth === scientificDepth);
        if (p) obsVal = p[scientificVariable];
      }
      
      if (obsVal === null || obsVal === undefined) return;

      // Spatial matching: Nearest Neighbor in 4-degree grid
      const row = Math.floor((obs.latitude + 90) / 4);
      const col = Math.floor((obs.longitude + 180) / 4);
      const idx = row * 90 + col;

      const modelVal = modelVarData[idx];
      if (modelVal === null || modelVal === undefined || modelVal < -100) return;

      // Region Filtering
      if (appState.activeOceanId && appState.activeOceanId !== 'global') {
        // dynamic import or define bounds locally
        // We know bounds: [minLat, maxLat, minLon, maxLon]
        // But let's just do a simple check. If activeOceanId is set, fetch it from a map.
        const boundsMap: Record<string, [number, number, number, number]> = {
          pacific: [-60, 60, 110, -70], // Handles antimeridian crossing
          atlantic: [-60, 60, -90, 20],
          indian: [-60, 25, 30, 115],
          southern: [-90, -60, -180, 180],
          arctic: [65, 90, -180, 180]
        };
        const b = boundsMap[appState.activeOceanId];
        if (b) {
          const [minLat, maxLat, minLon, maxLon] = b;
          const latOk = obs.latitude >= minLat && obs.latitude <= maxLat;
          let lonOk = false;
          if (minLon > maxLon) {
             lonOk = obs.longitude >= minLon || obs.longitude <= maxLon;
          } else {
             lonOk = obs.longitude >= minLon && obs.longitude <= maxLon;
          }
          if (!latOk || !lonOk) return;
        }
      }

      const diff = obsVal - modelVal;
      sumDiff += diff;
      sumAbsDiff += Math.abs(diff);
      sumSqDiff += diff * diff;

      const phi = (90 - obs.latitude) * (Math.PI / 180);
      const theta = (obs.longitude + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));

      const normal = new THREE.Vector3(x, y, z).normalize();
      const dummy = new THREE.Object3D();
      dummy.position.set(x, y, z);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), normal);
      dummy.updateMatrix();

      validComparisons.push({
        id: obs.id,
        obs,
        obsVal,
        modelVal,
        diff,
        matrix: dummy.matrix,
        color: getDiffColor(diff, maxDiff)
      });
    });

    const count = validComparisons.length;
    let r = 0;
    if (count > 1) {
      const meanObs = validComparisons.reduce((sum, c) => sum + c.obsVal, 0) / count;
      const meanModel = validComparisons.reduce((sum, c) => sum + c.modelVal, 0) / count;
      let num = 0;
      let den1 = 0;
      let den2 = 0;
      validComparisons.forEach(c => {
        const dx = c.modelVal - meanModel;
        const dy = c.obsVal - meanObs;
        num += dx * dy;
        den1 += dx * dx;
        den2 += dy * dy;
      });
      r = num / Math.sqrt(den1 * den2);
    }

    const statsResult = count > 0 ? {
      count,
      bias: sumDiff / count,
      mae: sumAbsDiff / count,
      rmse: Math.sqrt(sumSqDiff / count),
      r: r
    } : null;

    const matrixArray = new Float32Array(count * 16);
    const colorArray = new Float32Array(count * 3);

    validComparisons.forEach((c, i) => {
      c.matrix.toArray(matrixArray, i * 16);
      c.color.toArray(colorArray, i * 3);
    });

    return { matrices: matrixArray, colors: colorArray, stats: statsResult, comparisons: validComparisons };
  }, [modelDataset, obsDataset, isModelVsObs, scientificVariable, scientificDepth, activeObservations, appState.activeOceanId]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && comparisons.length > 0) {
      const c = comparisons[e.instanceId];
      if (c) {
        setHoveredData(c);
        document.body.style.cursor = 'pointer';
      }
    }
  };

  const handlePointerOut = () => {
    setHoveredData(null);
    document.body.style.cursor = 'auto';
  };

  if (!isModelVsObs) return null;

  return (
    <>
      {matrices && matrices.length > 0 && (
        <instancedMesh
          ref={meshRef}
          args={[MARKER_GEOMETRY, undefined, comparisons.length]}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
        >
          <meshBasicMaterial vertexColors={true} />
          <instancedBufferAttribute attach="instanceMatrix" args={[matrices, 16]} />
          <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
        </instancedMesh>
      )}

      {(loading || error) && (
        <Html center>
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-white/10 text-center pointer-events-none">
             {loading && <div className="text-red-400 text-xs tracking-widest uppercase animate-pulse">Loading Validation Engine...</div>}
             {error && <div className="text-red-400 text-xs tracking-widest uppercase">{error}</div>}
           </div>
        </Html>
      )}

      {!loading && !error && (!scientificVariable || (scientificVariable !== 'temperature' && scientificVariable !== 'salinity')) && (
        <Html center>
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-red-500/30 text-center pointer-events-none shadow-[0_0_30px_rgba(255,0,0,0.2)]">
             <div className="text-red-400 text-xs tracking-widest uppercase font-bold">Model vs Observation Mode Active</div>
             <div className="text-white/70 text-[10px] mt-2">Select Temperature or Salinity and an Observation Type<br/>to begin scientific validation.</div>
           </div>
        </Html>
      )}

      {!loading && !error && scientificVariable && activeObservations.length === 0 && (
        <Html center>
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-red-500/30 text-center pointer-events-none shadow-[0_0_30px_rgba(255,0,0,0.2)]">
             <div className="text-red-400 text-xs tracking-widest uppercase font-bold">No Observations Selected</div>
             <div className="text-white/70 text-[10px] mt-2">Select Argo, Glider, CTD or BGC to compare against the model.</div>
           </div>
        </Html>
      )}

            
      {/* Hover Tooltip */}
      {hoveredData && (
        <Html position={[
          -(2.03 * Math.sin((90 - hoveredData.obs.latitude) * Math.PI/180) * Math.cos((hoveredData.obs.longitude + 180) * Math.PI/180)),
          2.03 * Math.cos((90 - hoveredData.obs.latitude) * Math.PI/180),
          2.03 * Math.sin((90 - hoveredData.obs.latitude) * Math.PI/180) * Math.sin((hoveredData.obs.longitude + 180) * Math.PI/180)
        ]} style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
           <div className="bg-[#020408]/95 border border-red-500/30 p-3 rounded-lg text-xs text-white shadow-xl backdrop-blur-md w-56 translate-x-2 -translate-y-2 pointer-events-none">
              <div className="text-red-400 text-[9px] font-bold uppercase tracking-widest mb-1 border-b border-white/10 pb-1">
                 MODEL VS OBSERVATION
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[10px] mt-2">
                 <div className="text-white/50">Location:</div><div className="text-right">{Math.abs(hoveredData.obs.latitude).toFixed(2)}°{hoveredData.obs.latitude>=0?'N':'S'} {Math.abs(hoveredData.obs.longitude).toFixed(2)}°{hoveredData.obs.longitude>=0?'E':'W'}</div>
                 <div className="text-white/50">Depth:</div><div className="text-right">{scientificDepth}m</div>
                 <div className="text-white/50">Observation:</div><div className="text-right font-mono text-cyan-400">{hoveredData.obsVal.toFixed(2)}</div>
                 <div className="text-white/50">Model:</div><div className="text-right font-mono text-white/70">{hoveredData.modelVal.toFixed(2)}</div>
                 <div className="text-white/50 mt-1 pt-1 border-t border-white/10">Difference:</div>
                 <div className={`text-right font-mono font-bold mt-1 pt-1 border-t border-white/10 ${hoveredData.diff > 0 ? 'text-red-400' : (hoveredData.diff < 0 ? 'text-blue-400' : 'text-white')}`}>
                   {hoveredData.diff > 0 ? '+' : ''}{hoveredData.diff.toFixed(2)}
                 </div>
              </div>
           </div>
        </Html>
      )}
    </>
  );
}



