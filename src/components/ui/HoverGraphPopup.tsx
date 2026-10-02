import { useEffect, useState } from 'react';

export function HoverGraphPopup() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setData(e.detail);
    };
    window.addEventListener('oceanDataHover', handler);
    return () => window.removeEventListener('oceanDataHover', handler);
  }, []);

  if (!data) return null;

  const { variable, lat, lon, val, speed, depth, time } = data;
  
  let displayTitle = '';
  
  let unit = '';
  let sourceStr = '';
  
  if (variable === 'temperature') {
    displayTitle = 'Temperature';
    
    unit = '°C';
    sourceStr = 'NOAA NCEI — World Ocean Atlas 2023';
  } else if (variable === 'salinity') {
    displayTitle = 'Salinity';
    
    unit = 'PSU';
    sourceStr = 'NOAA NCEI — World Ocean Atlas 2023';
  } else if (variable === 'chlorophyll') {
    displayTitle = 'Chlorophyll';
    
    unit = 'mg/m³';
    sourceStr = 'INCOIS IRS P4 OCM';
  } else if (variable === 'currents') {
    displayTitle = 'Ocean Current';
    
    unit = 'm/s';
    sourceStr = 'Global Circulation Model (DEMO)';
  }

  // Handle "No data available at this location"
  if (val === null && speed === undefined) {
    return (
      <div className="absolute top-32 right-6 z-20 w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 p-4">
        <p className="text-white/60 text-xs text-center">Historical data unavailable for this location.</p>
      </div>
    );
  }

  const numericValue = variable === 'currents' ? speed : val;
  
  // Format the time string nicely
  let timeLabel = time || 'Climatology';
  if (timeLabel.includes('T')) {
    timeLabel = timeLabel.substring(0, 4); // Just the year e.g., 2023
  }
  
  const coverageText = timeLabel.includes('Climatology') ? 'Decadal Climatology (1 year)' : `${timeLabel} (1 year)`;

  // The actual available historical data from the existing datasets
  // Since all loaded datasets are single snapshots, we only have 1 valid historical point.
  const points = [{ time: timeLabel, val: numericValue }];
  
  const minVal = numericValue - (numericValue * 0.1 || 1);
  const maxVal = numericValue + (numericValue * 0.1 || 1);

  const width = 280;
  const height = 120;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (idx: number) => paddingX + (points.length === 1 ? (width - 2*paddingX)/2 : (idx / (points.length - 1)) * (width - 2*paddingX));
  const getY = (v: number) => height - paddingY - ((v - minVal) / (maxVal - minVal)) * (height - 2*paddingY);

  return (
    <div className="absolute top-32 right-6 z-20 w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden transition-all duration-300 pointer-events-none">
      <div className="p-4 border-b border-white/10">
        <h2 className="font-bold text-sm tracking-wider text-cyan-400 mb-2 leading-tight">
          {displayTitle} — Historical Comparison
        </h2>
        
        <div className="text-[10px] tracking-widest text-white/50 uppercase space-y-1 mb-2">
          <div>Lat: {Math.abs(lat).toFixed(2)}° {lat >= 0 ? 'N' : 'S'} &nbsp;|&nbsp; Lon: {Math.abs(lon).toFixed(2)}° {lon >= 0 ? 'E' : 'W'}</div>
          <div>Depth: {depth === 0 || depth === 'Surface' ? 'Surface' : `${depth} m`}</div>
        </div>
        
        <div className="text-[9px] text-white/40 uppercase tracking-widest border-t border-white/5 pt-2 mt-2">
          <div className="mb-0.5">Source: {sourceStr}</div>
          <div className="text-yellow-400/80">Available historical data: {coverageText}</div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Graph */}
        <div className="relative w-full h-[120px] bg-black/20 rounded border border-white/5 group">
          <svg width={width} height={height} className="overflow-visible">
            {/* Y Axis labels */}
            <text x={paddingX - 5} y={paddingY + 4} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">{maxVal.toFixed(1)}</text>
            <text x={paddingX - 5} y={height - paddingY + 4} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">{minVal.toFixed(1)}</text>
            
            {/* Grid lines */}
            <line x1={paddingX} y1={height - paddingY} x2={width - 10} y2={height - paddingY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            
            {/* Points */}
            {points.map((p, i) => (
              <g key={i}>
                <line x1={getX(i)} y1={height - paddingY} x2={getX(i)} y2={getY(p.val)} stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx={getX(i)} cy={getY(p.val)} r="4" fill="#22d3ee" className="shadow-[0_0_10px_#22d3ee]" />
                <text x={getX(i)} y={height - 5} fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle" className="tracking-widest uppercase">
                  {p.time}
                </text>
                
                {/* Tooltip emulation */}
                <rect x={getX(i) - 25} y={getY(p.val) - 22} width="50" height="14" fill="rgba(0,0,0,0.8)" rx="2" />
                <text x={getX(i)} y={getY(p.val) - 12} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">
                  {p.val.toFixed(2)} {unit}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Summary Table */}
        <div className="mt-4 bg-black/30 rounded p-2 text-[9px] tracking-widest text-white/50 uppercase grid grid-cols-2 gap-y-1.5">
          <div>Earliest: <span className="text-white">{points[0].time}</span></div>
          <div>Latest: <span className="text-white">{points[points.length-1].time}</span></div>
          <div>Change: <span className="text-white">N/A (1 data point)</span></div>
          <div>Range: <span className="text-white">{numericValue.toFixed(2)} – {numericValue.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
