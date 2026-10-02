import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(0,240,255,0.15)] relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
          ABOUT OCEANLENS
        </h2>
        
        <div className="space-y-4 text-white/80 leading-relaxed text-sm">
          <p>
            OceanLens is an interactive 3D ocean visualization platform built to make complex ocean data easier to see, explore and understand.
          </p>
          <p>
            The ocean is constantly changing across location, depth and time, but this information is often hidden inside complex datasets, scientific files and conventional charts. OceanLens transforms these multidimensional datasets into an immersive digital ocean where users can visually explore what is happening beneath the surface.
          </p>
          <p>
            With an interactive 3D Earth, users can explore major oceans and seas, switch between scientific parameters such as Temperature, Salinity, Currents and Chlorophyll, investigate different depth levels, and interact directly with ocean data through an intuitive visual interface.
          </p>
          <p>
            OceanLens is designed around real scientific data workflows, including oceanographic datasets and observation sources. Its architecture combines modern web technologies such as React, TypeScript, Vite and Three.js/WebGL with data-processing workflows for scientific ocean datasets.
          </p>
          <p>
            Our goal is simple: turn complicated ocean data into something people can actually see, explore and understand.
          </p>
          <p className="text-cyan-400 font-medium pt-2">
            OceanLens — Learn. Explore. Understand. 🌊
          </p>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded hover:bg-cyan-500/40 text-cyan-50 text-sm tracking-widest uppercase transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
