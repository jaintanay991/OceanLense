import { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { EarthScene } from './scene/EarthScene';
import { Header } from './components/ui/Header';
import { ControlsOverlay } from './components/ui/ControlsOverlay';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  const [cinematicMode, setCinematicMode] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleReset = useCallback(() => {
    setResetTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Header cinematicMode={cinematicMode} />
      
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 0, 5.5], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, powerPreference: "high-performance" }}
            >
              <EarthScene 
                cinematicMode={cinematicMode} 
                resetTrigger={resetTrigger}
              />
            </Canvas>
          </div>
        </Suspense>
      </ErrorBoundary>

      <ControlsOverlay 
        cinematicMode={cinematicMode}
        onToggleCinematic={() => setCinematicMode(prev => !prev)}
        onReset={handleReset}
      />
    </div>
  );
}

export default App;
