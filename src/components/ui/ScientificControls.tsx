import type { AppState, SetAppState } from '../../types';
import { Layers } from 'lucide-react';

interface ScientificControlsProps {
  appState: AppState;
  setAppState: SetAppState;
}

export function ScientificControls({ appState, setAppState }: ScientificControlsProps) {
  const handleToggleVariable = (variable: 'temperature' | 'salinity') => {
    setAppState(prev => ({
      ...prev,
      scientificVariable: prev.scientificVariable === variable ? null : variable,
      scientificDepth: prev.scientificDepth // keep depth
    }));
  };

  const handleDepthChange = (depth: number) => {
    setAppState(prev => ({ ...prev, scientificDepth: depth }));
  };

  const depths = [0, 500]; // We only fetched 0m and 500m in our subset

  return (
    <div className="absolute left-6 bottom-6 z-10 w-64">
      {/* Variable Toggle */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-3 flex items-center">
          <Layers size={12} className="mr-2" />
          Scientific Variable
        </h3>
        
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => handleToggleVariable('temperature')}
            className={`px-4 py-2 rounded text-xs tracking-widest uppercase transition-all duration-300 border ${
              appState.scientificVariable === 'temperature' 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' 
                : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Temperature
          </button>
          
          <button 
            onClick={() => handleToggleVariable('salinity')}
            className={`px-4 py-2 rounded text-xs tracking-widest uppercase transition-all duration-300 border ${
              appState.scientificVariable === 'salinity' 
                ? 'bg-blue-500/20 border-blue-400 text-blue-400' 
                : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Salinity
          </button>
        </div>
      </div>

      {/* Depth & Legend Control (only visible if variable is selected) */}
      {appState.scientificVariable && (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500">
          
          {/* Depth Selector */}
          <div className="mb-6">
            <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Depth Level</h3>
            <div className="flex space-x-2">
              {depths.map(depth => (
                <button
                  key={depth}
                  onClick={() => handleDepthChange(depth)}
                  className={`flex-1 py-1.5 rounded text-[10px] tracking-widest transition-all ${
                    appState.scientificDepth === depth 
                      ? 'bg-white/20 text-white font-bold' 
                      : 'bg-transparent text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {depth === 0 ? 'Surface' : `${depth}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div>
            <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-2 flex justify-between">
              <span>{appState.scientificVariable === 'temperature' ? 'Sea Water Temp' : 'Practical Salinity'}</span>
              <span>{appState.scientificVariable === 'temperature' ? '°C' : 'PSU'}</span>
            </h3>
            
            <div 
              className="h-2 w-full rounded-full mb-2"
              style={{
                background: appState.scientificVariable === 'temperature' 
                  ? 'linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000, #800000)'
                  : 'linear-gradient(to right, #330066, #008080, #ccf233)'
              }}
            />
            
            <div className="flex justify-between text-[9px] tracking-widest text-white/50 uppercase">
              <span>{appState.scientificVariable === 'temperature' ? '-2' : '30'}</span>
              <span>{appState.scientificVariable === 'temperature' ? '30+' : '38+'}</span>
            </div>
          </div>

          {/* Data Provenance Metadata */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 gap-2 text-[9px] tracking-widest text-white/40 uppercase">
              <div className="flex justify-between">
                <span>Source</span>
                <span className="text-white/70 text-right">NOAA WOA23</span>
              </div>
              <div className="flex justify-between">
                <span>Type</span>
                <span className="text-white/70 text-right">Annual Climatology</span>
              </div>
              <div className="flex justify-between">
                <span>Res</span>
                <span className="text-white/70 text-right">4° Subset</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
