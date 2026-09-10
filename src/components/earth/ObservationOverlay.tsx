import { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AppState, SetAppState } from '../../types';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';

interface ObservationOverlayProps {
  appState: AppState;
  setAppState: SetAppState;
}

const TYPE_COLORS = {
  argo: new THREE.Color('#f97316'), // orange-500
  glider: new THREE.Color('#a855f7'), // purple-500
  ctd: new THREE.Color('#eab308'), // yellow-500
  bgc: new THREE.Color('#22c55e'), // green-500
};

const MARKER_GEOMETRY = new THREE.DodecahedronGeometry(0.015, 0);

export function ObservationOverlay({ appState, setAppState }: ObservationOverlayProps) {
  const { activeObservations, isModelVsObs } = appState;
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (activeObservations.length === 0 && !dataset) return;
    if (dataset) return;

    setLoading(true);
    fetch('/demo_observations.json')
      .then(res => res.json())
      .then(data => {
        setDataset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load observations.');
        setLoading(false);
      });
  }, [activeObservations.length, dataset]);

  const { instancedData, linesGeom, pointMap } = useMemo(() => {
    if (!dataset || activeObservations.length === 0) return { instancedData: {} as Record<string, THREE.Matrix4[]>, linesGeom: null, pointMap: new Map<string, any>() };

    const observations = dataset.observations;
    const instancedData: Record<string, THREE.Matrix4[]> = {
      argo: [], glider: [], ctd: [], bgc: []
    };
    
    const pMap = new Map<string, any>();
    const lineVertices: number[] = [];

    const radius = 2.02; // Just above Earth and scientific overlays

    observations.forEach((obs: any) => {
      if (!activeObservations.includes(obs.type)) return;

      pMap.set(obs.id, obs);

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
      
      instancedData[obs.type].push(dummy.matrix);

      // Trajectory lines for gliders
      if (obs.type === 'glider' && obs.trajectory) {
        let prevX = x, prevY = y, prevZ = z;
        obs.trajectory.forEach((traj: any) => {
          const tPhi = (90 - traj.latitude) * (Math.PI / 180);
          const tTheta = (traj.longitude + 180) * (Math.PI / 180);
          const tx = -(radius * Math.sin(tPhi) * Math.cos(tTheta));
          const tz = (radius * Math.sin(tPhi) * Math.sin(tTheta));
          const ty = (radius * Math.cos(tPhi));

          lineVertices.push(prevX, prevY, prevZ);
          lineVertices.push(tx, ty, tz);
          prevX = tx; prevY = ty; prevZ = tz;
        });
      }
    });

    let linesGeom = null;
    if (lineVertices.length > 0) {
      linesGeom = new THREE.BufferGeometry();
      linesGeom.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    }

    return { instancedData, linesGeom, pointMap: pMap };
  }, [dataset, activeObservations]);

  const refs = {
    argo: useRef<THREE.InstancedMesh>(null),
    glider: useRef<THREE.InstancedMesh>(null),
    ctd: useRef<THREE.InstancedMesh>(null),
    bgc: useRef<THREE.InstancedMesh>(null),
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>, type: string) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      if (!dataset) return;
      const typeObs = dataset.observations.filter((o: any) => activeObservations.includes(o.type) && o.type === type);
      const obs = typeObs[e.instanceId];
      if (obs) {
        setHoveredId(obs.id);
        document.body.style.cursor = 'pointer';
      }
    }
  };

  const handlePointerOut = () => {
    setHoveredId(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>, type: string) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && dataset) {
      const typeObs = dataset.observations.filter((o: any) => activeObservations.includes(o.type) && o.type === type);
      const obs = typeObs[e.instanceId];
      if (obs) {
        setAppState(prev => ({ ...prev, selectedObservationId: obs.id }));
      }
    }
  };

  if (activeObservations.length === 0 || isModelVsObs) return null;

  const hoveredObs = hoveredId ? pointMap.get(hoveredId) : null;

  return (
    <>
      {(['argo', 'glider', 'ctd', 'bgc'] as const).map((type) => {
        const matrices = instancedData[type];
        if (!matrices || matrices.length === 0) return null;

        // Rebuild Float32Array on every render because matrices can change
        const matrixArray = new Float32Array(matrices.length * 16);
        matrices.forEach((m: THREE.Matrix4, i: number) => {
          m.toArray(matrixArray, i * 16);
        });

        return (
          <instancedMesh
            key={type}
            ref={refs[type as keyof typeof refs]}
            args={[MARKER_GEOMETRY, undefined, matrices.length]}
            onPointerMove={(e) => handlePointerMove(e, type)}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, type)}
          >
            <meshBasicMaterial color={TYPE_COLORS[type as keyof typeof TYPE_COLORS]} />
            <instancedBufferAttribute 
              attach="instanceMatrix" 
              args={[matrixArray, 16]} 
            />
          </instancedMesh>
        );
      })}

      {linesGeom && (
        <lineSegments geometry={linesGeom}>
          <lineBasicMaterial color={TYPE_COLORS.glider} opacity={0.6} transparent />
        </lineSegments>
      )}

      {(loading || error) && (
        <Html center>
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-white/10 text-center pointer-events-none">
             {loading && <div className="text-cyan-400 text-xs tracking-widest uppercase animate-pulse">Loading Observations...</div>}
             {error && <div className="text-red-400 text-xs tracking-widest uppercase">{error}</div>}
           </div>
        </Html>
      )}

      {hoveredObs && (
        <Html position={[
          -(2.02 * Math.sin((90 - hoveredObs.latitude) * Math.PI/180) * Math.cos((hoveredObs.longitude + 180) * Math.PI/180)),
          2.02 * Math.cos((90 - hoveredObs.latitude) * Math.PI/180),
          2.02 * Math.sin((90 - hoveredObs.latitude) * Math.PI/180) * Math.sin((hoveredObs.longitude + 180) * Math.PI/180)
        ]} style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
           <div className="bg-[#020408]/95 border border-white/20 p-3 rounded-lg text-xs text-white shadow-xl backdrop-blur-md w-48 translate-x-2 -translate-y-2 pointer-events-none">
              <div className="text-white/50 text-[9px] uppercase tracking-widest mb-1 flex items-center">
                 <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: TYPE_COLORS[hoveredObs.type as keyof typeof TYPE_COLORS].getStyle() }} />
                 {hoveredObs.type.toUpperCase()} OBSERVATION
              </div>
              <div className="font-bold border-b border-white/10 pb-2 mb-2 break-all">
                 Platform: {hoveredObs.platformId}
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-[10px]">
                 <div className="text-white/50">Lat:</div><div>{Math.abs(hoveredObs.latitude).toFixed(2)}° {hoveredObs.latitude >= 0 ? 'N' : 'S'}</div>
                 <div className="text-white/50">Lon:</div><div>{Math.abs(hoveredObs.longitude).toFixed(2)}° {hoveredObs.longitude >= 0 ? 'E' : 'W'}</div>
                 <div className="text-white/50">Date:</div><div>{new Date(hoveredObs.timestamp).toLocaleDateString()}</div>
              </div>
              {hoveredObs.profile && hoveredObs.profile.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                  {hoveredObs.profile.length} Depth Profile{hoveredObs.profile.length > 1 ? 's' : ''}
                </div>
              )}
           </div>
        </Html>
      )}
    </>
  );
}
