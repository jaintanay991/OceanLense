import { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import type { AppState } from './types';
import { EarthScene } from './scene/EarthScene';
import { Header } from './components/ui/Header';
import { ControlsOverlay } from './components/ui/ControlsOverlay';
import { ScientificControls } from './components/ui/ScientificControls';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-8 bg-[#020408]/90 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        <div className="w-12 h-12 relative mb-6">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <h2 className="text-xl font-bold tracking-[0.2em] text-white m-0">
          OCEANLENS
        </h2>
        <p className="text-cyan-400/80 text-xs tracking-[0.2em] uppercase mt-4 text-center whitespace-nowrap">
          Initializing Environment... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

function App() {
  const [cinematicMode, setCinematicMode] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [appState, setAppState] = useState<AppState>({
    activeRegionType: 'GLOBAL',
    activeOceanId: null,
    activeSeaId: null,
    scientificVariable: null,
    scientificDepth: 0,
  });

  const handleReset = useCallback(() => {
    setResetTrigger(prev => prev + 1);
    setAppState({ 
      activeRegionType: 'GLOBAL', 
      activeOceanId: null, 
      activeSeaId: null,
      scientificVariable: null,
      scientificDepth: 0
    });
  }, []);

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center"
      style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}
    >
      <Header cinematicMode={cinematicMode} />
      
      <ErrorBoundary>
        <div 
          className="absolute inset-0 z-0 flex"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
        >
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <Suspense fallback={<CanvasLoader />}>
              <EarthScene 
                cinematicMode={cinematicMode} 
                resetTrigger={resetTrigger}
                appState={appState}
              />
            </Suspense>
          </Canvas>
        </div>
      </ErrorBoundary>

      <ControlsOverlay 
        cinematicMode={cinematicMode}
        onToggleCinematic={() => setCinematicMode(prev => !prev)}
        onReset={handleReset}
        appState={appState}
        setAppState={setAppState}
      />
      <ScientificControls appState={appState} setAppState={setAppState} />
    </div>
  );
}

export default App;
