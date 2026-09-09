import { Camera, RotateCcw, Search, ChevronRight, X } from 'lucide-react';
import type { AppState, SetAppState } from '../../types';
import { OCEANS } from '../../data/oceans';
import { useState } from 'react';

interface ControlsOverlayProps {
  cinematicMode: boolean;
  onToggleCinematic: () => void;
  onReset: () => void;
  appState: AppState;
  setAppState: SetAppState;
}

export function ControlsOverlay({ cinematicMode, onToggleCinematic, onReset, appState, setAppState }: ControlsOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSelectOcean = (oceanId: string | null) => {
    if (!oceanId) {
      setAppState(prev => ({ ...prev, activeRegionType: 'GLOBAL', activeOceanId: null, activeSeaId: null }));
    } else {
      setAppState(prev => ({ ...prev, activeRegionType: 'OCEAN', activeOceanId: oceanId, activeSeaId: null }));
    }
  };

  const handleSelectSea = (seaId: string) => {
    setAppState(prev => ({ ...prev, activeRegionType: 'SEA', activeSeaId: seaId }));
  };

  const activeOcean = appState.activeOceanId ? OCEANS[appState.activeOceanId] : null;
  const activeSea = activeOcean?.majorSeas.find(s => s.id === appState.activeSeaId);

  // Filter oceans for search
  const searchResults = Object.values(OCEANS).filter(ocean => 
    searchQuery && ocean.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const searchSeaResults = Object.values(OCEANS).flatMap(ocean => 
    ocean.majorSeas.filter(sea => searchQuery && sea.name.toLowerCase().includes(searchQuery.toLowerCase())).map(sea => ({...sea, oceanId: ocean.id}))
  );

  return (
    <>
      {/* Navigation Foundation */}
      <div 
        className={`absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-1000 ${
          cinematicMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleSelectOcean(null)}
            className={`text-left text-xs tracking-widest uppercase transition-colors duration-300 ${
              appState.activeRegionType === 'GLOBAL' ? 'text-cyan-400 font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            GLOBAL
          </button>
          {Object.values(OCEANS).map((ocean) => (
            <button
              key={ocean.id}
              onClick={() => handleSelectOcean(ocean.id)}
              className={`text-left text-xs tracking-widest uppercase transition-colors duration-300 ${
                appState.activeOceanId === ocean.id ? 'text-cyan-400 font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              {ocean.name}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumbs and Search - Top Right */}
      <div className={`absolute top-6 right-6 z-10 flex flex-col items-end transition-opacity duration-1000 ${
        cinematicMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="flex items-center space-x-2 text-xs tracking-widest uppercase mb-4 bg-slate-900/60 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full">
          <button onClick={() => handleSelectOcean(null)} className="text-white/70 hover:text-cyan-400 transition-colors">GLOBAL</button>
          {activeOcean && (
            <>
              <ChevronRight size={12} className="text-white/30" />
              <button onClick={() => handleSelectOcean(activeOcean.id)} className={`transition-colors ${appState.activeRegionType === 'OCEAN' ? 'text-cyan-400' : 'text-white/70 hover:text-cyan-400'}`}>{activeOcean.name}</button>
            </>
          )}
          {activeSea && (
            <>
              <ChevronRight size={12} className="text-white/30" />
              <span className="text-cyan-400">{activeSea.name}</span>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 focus-within:border-cyan-400/50 transition-colors">
            <Search size={14} className="text-white/50 mr-2" />
            <input 
              type="text" 
              placeholder="SEARCH..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs tracking-widest text-white placeholder-white/30 w-48"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/50 hover:text-white ml-2">
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* Search Dropdown */}
          {searchQuery && (searchResults.length > 0 || searchSeaResults.length > 0) && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded overflow-hidden max-h-64 overflow-y-auto shadow-xl">
              {searchResults.map(ocean => (
                <button 
                  key={ocean.id} 
                  className="w-full text-left px-4 py-3 text-xs tracking-widest text-white hover:bg-white/5 border-b border-white/5 last:border-0"
                  onClick={() => { handleSelectOcean(ocean.id); setSearchQuery(''); }}
                >
                  <span className="text-cyan-400 block mb-1">OCEAN</span>
                  {ocean.name}
                </button>
              ))}
              {searchSeaResults.map(sea => (
                <button 
                  key={sea.id} 
                  className="w-full text-left px-4 py-3 text-xs tracking-widest text-white hover:bg-white/5 border-b border-white/5 last:border-0"
                  onClick={() => { handleSelectOcean(sea.oceanId); handleSelectSea(sea.id); setSearchQuery(''); }}
                >
                  <span className="text-blue-400 block mb-1">SEA</span>
                  {sea.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ocean Info Panel */}
      {appState.activeRegionType === 'OCEAN' && activeOcean && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-80 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold tracking-[0.1em] text-white m-0 uppercase">{activeOcean.name}</h2>
          <p className="text-cyan-400 text-xs tracking-widest uppercase mt-1 mb-6 opacity-80">{activeOcean.subtitle}</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-2">Overview</h3>
              <p className="text-sm text-white/90 leading-relaxed font-light">{activeOcean.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Area</h3>
                <p className="text-sm text-white font-medium">{activeOcean.area}</p>
              </div>
              <div>
                <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Avg Depth</h3>
                <p className="text-sm text-white font-medium">{activeOcean.averageDepth}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Continents</h3>
                <p className="text-xs text-white/80">{activeOcean.surroundingContinents.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Currents</h3>
                <p className="text-xs text-white/80">{activeOcean.majorCurrents.join(', ')}</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Major Seas</h3>
              <div className="flex flex-wrap gap-2">
                {activeOcean.majorSeas.map(sea => (
                  <button 
                    key={sea.id}
                    onClick={() => handleSelectSea(sea.id)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 rounded text-xs text-white/80 transition-colors"
                  >
                    {sea.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sea Info Panel */}
      {appState.activeRegionType === 'SEA' && activeSea && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-80 bg-slate-900/80 backdrop-blur-md border border-blue-500/20 rounded-xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-10">
          <h2 className="text-xl font-bold tracking-[0.1em] text-white m-0 uppercase">{activeSea.name}</h2>
          <p className="text-blue-400 text-xs tracking-widest uppercase mt-1 mb-6 opacity-80">Marginal Sea</p>
          
          <div className="space-y-4">
            <p className="text-sm text-white/90 leading-relaxed font-light">{activeSea.description}</p>
            
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Area</h3>
              <p className="text-sm text-white font-medium">{activeSea.area}</p>
            </div>
            
            <button 
              onClick={() => handleSelectOcean(appState.activeOceanId)}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs tracking-widest text-white transition-colors"
            >
              BACK TO {activeOcean?.name.toUpperCase()}
            </button>
          </div>
        </div>
      )}

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
    </>
  );
}
