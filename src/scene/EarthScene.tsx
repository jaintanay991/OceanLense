import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Earth } from '../components/earth/Earth';
import { Atmosphere } from '../components/earth/Atmosphere';
import { Clouds } from '../components/earth/Clouds';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import type { AppState, SetAppState } from '../types';
import { OCEANS } from '../data/oceans';
import { OceanHighlight } from '../components/earth/OceanHighlight';
import { ScientificOverlay } from '../components/earth/ScientificOverlay';
import { ObservationOverlay } from '../components/earth/ObservationOverlay';
import { ModelVsObsOverlay } from '../components/earth/ModelVsObsOverlay';
import { CurrentOverlay } from '../components/earth/CurrentOverlay';

interface EarthSceneProps {
  cinematicMode: boolean;
  resetTrigger: number;
  appState: AppState;
  setAppState: SetAppState;
}

function getCameraTargetPos(appState: AppState): THREE.Vector3 {
  if (appState.activeRegionType === 'GLOBAL' || !appState.activeOceanId) {
    return new THREE.Vector3(0, 0, 5.5);
  }

  let lat = 0;
  let lon = 0;
  let dist = 4.5;

  const ocean = OCEANS[appState.activeOceanId];
  if (ocean) {
    lat = ocean.coordinates[0];
    lon = ocean.coordinates[1];
    
    if (appState.activeRegionType === 'SEA' && appState.activeSeaId) {
      const sea = ocean.majorSeas.find(s => s.id === appState.activeSeaId);
      if (sea) {
        lat = sea.coordinates[0];
        lon = sea.coordinates[1];
        dist = 3.2; // closer for seas
      }
    }
  }

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(dist * Math.sin(phi) * Math.cos(theta)),
    dist * Math.cos(phi),
    dist * Math.sin(phi) * Math.sin(theta)
  );
}

export function EarthScene({ cinematicMode, resetTrigger, appState, setAppState }: EarthSceneProps) {
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

    // Lerp camera to target
    const currentTarget = getCameraTargetPos(appState);
    if (!cinematicMode && appState.activeRegionType !== 'GLOBAL') {
      state.camera.position.lerp(currentTarget, 2.5 * delta);
      state.camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
         controlsRef.current.update();
      }
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
        <OceanHighlight appState={appState} />
        <ScientificOverlay appState={appState} setAppState={setAppState} />
        <CurrentOverlay appState={appState} setAppState={setAppState} />
        <ObservationOverlay appState={appState} setAppState={setAppState} />
        <ModelVsObsOverlay appState={appState} setAppState={setAppState} />
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
