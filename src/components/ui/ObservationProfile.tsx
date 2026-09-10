import { useEffect, useState } from 'react';
import type { AppState, SetAppState } from '../../types';
import { X, Activity } from 'lucide-react';

interface ObservationProfileProps {
  appState: AppState;
  setAppState: SetAppState;
}

export function ObservationProfile({ appState, setAppState }: ObservationProfileProps) {
  const [obsData, setObsData] = useState<any>(null);
  const [modelData, setModelData] = useState<any>(null);

  useEffect(() => {
    if (appState.selectedObservationId) {
      Promise.all([
        fetch('/demo_observations.json').then(res => res.json()),
        appState.isModelVsObs ? fetch('/woa23_subset.json').then(res => res.json()) : Promise.resolve(null)
      ]).then(([obsDataset, modDataset]) => {
        const obs = obsDataset.observations.find((o: any) => o.id === appState.selectedObservationId);
        if (obs) setObsData(obs);
        if (modDataset) setModelData(modDataset);
      });
    } else {
      setObsData(null);
      setModelData(null);
    }
  }, [appState.selectedObservationId, appState.isModelVsObs]);

  if (!appState.selectedObservationId || !obsData) return null;

  const close = () => {
    setAppState(prev => ({ ...prev, selectedObservationId: null }));
  };

  const hasProfile = obsData.profile && obsData.profile.length > 0;
  const isValidation = appState.isModelVsObs && appState.scientificVariable && (appState.scientificVariable === 'temperature' || appState.scientificVariable === 'salinity');

  return (
    <div className={`absolute right-6 top-6 bottom-6 ${isValidation ? 'w-96 border-red-500/50 shadow-[0_0_30px_rgba(255,0,0,0.2)]' : 'w-80 border-white/20'} bg-slate-900/90 backdrop-blur-xl rounded-xl flex flex-col overflow-hidden shadow-2xl z-50`}>
      <div className={`p-4 border-b flex justify-between items-center ${isValidation ? 'bg-red-950/40 border-red-500/30' : 'bg-black/20 border-white/10'}`}>
        <h2 className={`font-bold text-sm tracking-wider uppercase flex items-center ${isValidation ? 'text-red-400' : 'text-white'}`}>
          <Activity size={16} className={`mr-2 ${isValidation ? 'text-red-400' : 'text-cyan-400'}`} />
          {isValidation ? 'Model vs Observation' : `${obsData.type} Observation`}
        </h2>
        <button onClick={close} className="text-white/50 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Platform ID</div>
            <div className="text-sm text-white font-mono">{obsData.platformId}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Position</div>
              <div className="text-sm text-white">
                {Math.abs(obsData.latitude).toFixed(3)}° {obsData.latitude >= 0 ? 'N' : 'S'}
                <br />
                {Math.abs(obsData.longitude).toFixed(3)}° {obsData.longitude >= 0 ? 'E' : 'W'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Observed</div>
              <div className="text-sm text-white">
                {new Date(obsData.timestamp).toLocaleDateString()}
                <br />
                <span className="text-xs text-white/60">{new Date(obsData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Obs Source</div>
                <div className="text-xs text-cyan-400">{obsData.source}</div>
              </div>
              {isValidation && (
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Model Source</div>
                  <div className="text-xs text-red-400">NOAA WOA23</div>
                </div>
              )}
            </div>
          </div>

          {hasProfile && !isValidation && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Depth Profile ({obsData.profile.length} levels)</div>
              
              <div className="bg-black/30 rounded border border-white/5 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-white/50">
                    <tr>
                      <th className="p-2 font-normal">Depth</th>
                      <th className="p-2 font-normal">Temp</th>
                      <th className="p-2 font-normal">Salinity</th>
                      {obsData.profile[0].oxygen !== undefined && <th className="p-2 font-normal">O2</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {obsData.profile.map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors text-white/80">
                        <td className="p-2 font-mono">{p.depth}m</td>
                        <td className="p-2">{p.temperature}°C</td>
                        <td className="p-2">{p.salinity}</td>
                        {p.oxygen !== undefined && <td className="p-2">{p.oxygen}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasProfile && isValidation && modelData && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Validation Profile: {appState.scientificVariable}</div>
              
              <div className="bg-black/30 rounded border border-white/5 overflow-hidden">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-white/50">
                    <tr>
                      <th className="p-2 font-normal">Depth</th>
                      <th className="p-2 font-normal">Obs</th>
                      <th className="p-2 font-normal">Model</th>
                      <th className="p-2 font-normal text-right">Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {obsData.profile.map((p: any, i: number) => {
                      const obsVal = p[appState.scientificVariable as string];
                      if (obsVal === undefined) return null;

                      // get model value
                      const row = Math.floor((obsData.latitude + 90) / 4);
                      const col = Math.floor((obsData.longitude + 180) / 4);
                      const idx = row * 90 + col;
                      const modelLayer = modelData.variables[appState.scientificVariable as string]?.data[p.depth.toString()];
                      let modelVal = null;
                      if (modelLayer) {
                        modelVal = modelLayer[idx];
                      }

                      if (modelVal === null || modelVal === undefined || modelVal < -100) return null;

                      const diff = obsVal - modelVal;
                      const diffSign = diff > 0 ? '+' : '';
                      const diffColor = diff > 0 ? 'text-red-400' : (diff < 0 ? 'text-blue-400' : 'text-white/50');

                      return (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="p-2 font-mono text-white/50">{p.depth}m</td>
                          <td className="p-2 font-mono text-cyan-400">{obsVal.toFixed(2)}</td>
                          <td className="p-2 font-mono text-white/70">{modelVal.toFixed(2)}</td>
                          <td className={`p-2 font-mono font-bold text-right ${diffColor}`}>{diffSign}{diff.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
