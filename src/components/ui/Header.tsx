interface HeaderProps {
  cinematicMode: boolean;
}

export function Header({ cinematicMode }: HeaderProps) {
  return (
    <div 
      className={`absolute top-0 left-0 w-full p-6 z-10 transition-opacity duration-1000 ${
        cinematicMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Simple logo placeholder */}
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)] flex items-center justify-center">
          <div className="w-3 h-3 bg-cyan-400 rounded-full" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-white m-0 leading-none">
            OCEANLENS
          </h1>
          <p className="text-cyan-400 text-xs tracking-widest uppercase mt-1 opacity-80">
            Learn • Explore • Compare • Understand
          </p>
        </div>
      </div>
    </div>
  );
}
