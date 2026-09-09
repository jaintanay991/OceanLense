export function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 bg-[#020408] flex flex-col items-center justify-center">
      <div className="w-12 h-12 relative mb-6">
        <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      
      <h2 className="text-xl font-bold tracking-[0.2em] text-white m-0">
        OCEANLENS
      </h2>
      <p className="text-cyan-400/60 text-xs tracking-[0.3em] uppercase mt-4">
        Initializing Global 3D Environment...
      </p>
    </div>
  );
}
