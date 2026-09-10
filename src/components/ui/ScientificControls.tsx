import type { AppState, SetAppState } from '../../types';
import { Layers } from 'lucide-react';

interface ScientificControlsProps {
  appState: AppState;
  setAppState: SetAppState;
}

export function ScientificControls({ appState, setAppState }: ScientificControlsProps) {
  const handleToggleVariable = (variable: 'temperature' | 'salinity' | 'currents') => {
    setAppState(prev => ({
      ...prev,
      scientificVariable: prev.scientificVariable === variable ? null : variable,
      scientificDepth: prev.scientificDepth // keep depth
    }));
  };

  const handleDepthChange = (depth: number) => {
    setAppState(prev => ({ ...prev, scientificDepth: depth }));
  };

  const depths = [0, 500]; // We only fetched 0m and 500m in our subset for temp/salinity
  // Note: demo_currents only supports Surface. But we will hide 500m when currents is selected, or let it change the underlying data if we implement it.
  // We will restrict depth to Surface for currents.
  
  const isCurrents = appState.scientificVariable === 'currents';

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
          
          <button 
            onClick={() => handleToggleVariable('currents')}
            className={`px-4 py-2 rounded text-xs tracking-widest uppercase transition-all duration-300 border ${
              appState.scientificVariable === 'currents' 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Currents
          </button>
        </div>
        
        <div className="mt-6 mb-3 border-t border-white/10 pt-4">
          <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-3 flex items-center">
            <Layers size={12} className="mr-2" />
            Observations
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'argo', label: 'Argo', color: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400' },
              { id: 'glider', label: 'Gliders', color: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400' },
              { id: 'ctd', label: 'CTD', color: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' },
              { id: 'bgc', label: 'BGC', color: 'bg-green-500', border: 'border-green-500', text: 'text-green-400' },
            ].map(obs => {
              const isActive = appState.activeObservations.includes(obs.id as any);
              return (
                <button
                  key={obs.id}
                  onClick={() => {
                    setAppState(prev => ({
                      ...prev,
                      activeObservations: isActive 
                        ? prev.activeObservations.filter(id => id !== obs.id)
                        : [...prev.activeObservations, obs.id as any]
                    }));
                  }}
                  className={`flex items-center px-2 py-1.5 rounded text-[10px] tracking-widest uppercase transition-all duration-300 border ${
                    isActive 
                      ? `${obs.color}/20 ${obs.border} ${obs.text}` 
                      : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? obs.color : 'bg-white/30'}`} />
                  {obs.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <button 
            onClick={() => setAppState(prev => ({ ...prev, isModelVsObs: !prev.isModelVsObs, scientificVariable: prev.scientificVariable === 'currents' ? null : prev.scientificVariable }))}
            className={`w-full flex items-center justify-center px-4 py-2 rounded text-[10px] tracking-widest uppercase transition-all duration-300 border ${
              appState.isModelVsObs 
                ? 'bg-red-500/20 border-red-400 text-red-400' 
                : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Model vs Observation
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
              {(isCurrents ? [0] : depths).map(depth => (
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
              <span>
                {appState.scientificVariable === 'temperature' ? 'Sea Water Temp' : 
                 appState.scientificVariable === 'salinity' ? 'Practical Salinity' : 'Ocean Current Speed'}
              </span>
              <span>
                {appState.scientificVariable === 'temperature' ? '°C' : 
                 appState.scientificVariable === 'salinity' ? 'PSU' : 'm/s'}
              </span>
            </h3>
            
            <div 
              className="h-2 w-full rounded-full mb-2"
              style={{
                background: appState.scientificVariable === 'temperature' 
                  ? 'linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000, #800000)'
                  : appState.scientificVariable === 'salinity'
                  ? 'linear-gradient(to right, #330066, #008080, #ccf233)'
                  : 'linear-gradient(to right, #1a1a66, #3380cc, #33cc80, #e6e633, #e6661a, #b31a1a)' // Turbo-like for currents
              }}
            />
            
            <div className="flex justify-between text-[9px] tracking-widest text-white/50 uppercase">
              <span>
                {isCurrents ? '0' : (appState.scientificRange ? appState.scientificRange.min.toFixed(1) : (appState.scientificVariable === 'temperature' ? '-2' : '30'))}
              </span>
              <span>
                {isCurrents ? '1.5+' : (appState.scientificRange ? appState.scientificRange.max.toFixed(1) : (appState.scientificVariable === 'temperature' ? '30+' : '38+'))}
              </span>
            </div>
          </div>
          
          {/* Animation Controls (only for currents) */}
          {isCurrents && (
            <div className="mt-4 pt-4 border-t border-white/10">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-[10px] tracking-widest text-white/50 uppercase">Flow Animation</h3>
                 <button 
                   onClick={() => setAppState(prev => ({ ...prev, currentPlaying: !prev.currentPlaying }))}
                   className="text-white hover:text-emerald-400 transition-colors"
                 >
                   {appState.currentPlaying ? '❚❚' : '▶'}
                 </button>
               </div>
               <div className="flex justify-between items-center mb-1">
                 <h3 className="text-[10px] tracking-widest text-white/50 uppercase">Playback Speed</h3>
                 <span className="text-[9px] text-white/40">{appState.currentSpeed.toFixed(1)}x</span>
               </div>
               <input 
                 type="range" 
                 min="0.1" max="3.0" step="0.1"
                 value={appState.currentSpeed}
                 onChange={(e) => setAppState(prev => ({ ...prev, currentSpeed: parseFloat(e.target.value) }))}
                 className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
               />
            </div>
          )}

          {/* Data Provenance Metadata */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 gap-2 text-[9px] tracking-widest text-white/40 uppercase">
              <div className="flex justify-between">
                <span>Source</span>
                <span className="text-white/70 text-right">{isCurrents ? 'DEMONSTRATION DATA' : 'NOAA WOA23'}</span>
              </div>
              <div className="flex justify-between">
                <span>Type</span>
                <span className="text-white/70 text-right">{isCurrents ? 'Mathematical Model' : 'Annual Climatology'}</span>
              </div>
              <div className="flex justify-between">
                <span>Res</span>
                <span className="text-white/70 text-right">4° Subset</span>
              </div>
            </div>
          </div>

          {/* Opacity Control */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-[10px] tracking-widest text-white/50 uppercase">Opacity</h3>
               <span className="text-[9px] text-white/40">{Math.round(appState.scientificOpacity * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="1.0" step="0.05"
              value={appState.scientificOpacity}
              onChange={(e) => setAppState(prev => ({ ...prev, scientificOpacity: parseFloat(e.target.value) }))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

        </div>
      )}
    </div>
  );
}
