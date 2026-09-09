import { Camera, RotateCcw } from 'lucide-react';

interface ControlsOverlayProps {
  cinematicMode: boolean;
  onToggleCinematic: () => void;
  onReset: () => void;
}

export function ControlsOverlay({ cinematicMode, onToggleCinematic, onReset }: ControlsOverlayProps) {
  const regions = [
    'GLOBAL',
    'PACIFIC OCEAN',
    'ATLANTIC OCEAN',
    'INDIAN OCEAN',
    'SOUTHERN OCEAN',
    'ARCTIC OCEAN'
  ];

  return (
    <>
      {/* Navigation Foundation */}
      <div 
        className={`absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-1000 ${
          cinematicMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col space-y-4">
          {regions.map((region, i) => (
            <button
              key={region}
              className={`text-left text-xs tracking-widest uppercase transition-colors duration-300 ${
                i === 0 
                  ? 'text-cyan-400 font-medium' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex space-x-4">
        <button 
          onClick={onReset}
          className={`flex items-center space-x-2 px-4 py-2 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded text-xs tracking-widest text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 ${
            cinematicMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <RotateCcw size={14} />
          <span>RESET EARTH</span>
        </button>

        <button 
          onClick={onToggleCinematic}
          className={`flex items-center space-x-2 px-4 py-2 bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded text-xs tracking-widest text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400 transition-all duration-300 ${
            cinematicMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <Camera size={14} />
          <span>{cinematicMode ? 'EXIT CINEMATIC' : 'CINEMATIC MODE'}</span>
        </button>
      </div>

      {/* Crosshair / Center Reticle (optional aesthetic) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000 ${
        cinematicMode ? 'opacity-0' : 'opacity-20'
      }`}>
        <div className="relative w-8 h-8">
          <div className="absolute top-0 left-1/2 w-[1px] h-2 bg-cyan-400 -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-[1px] h-2 bg-cyan-400 -translate-x-1/2" />
          <div className="absolute left-0 top-1/2 h-[1px] w-2 bg-cyan-400 -translate-y-1/2" />
          <div className="absolute right-0 top-1/2 h-[1px] w-2 bg-cyan-400 -translate-y-1/2" />
        </div>
      </div>
    </>
  );
}
