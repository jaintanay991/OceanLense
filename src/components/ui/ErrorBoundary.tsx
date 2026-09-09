import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 bg-[#020408] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 mb-6 text-red-500 border-2 border-red-500/30 rounded-full flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-xl font-light tracking-[0.1em] text-white m-0">
            INITIALIZATION FAILED
          </h2>
          <p className="text-white/60 text-sm mt-4 max-w-md">
            The 3D environment could not be loaded. Please ensure your browser supports WebGL and hardware acceleration is enabled.
          </p>
          <div className="mt-8 text-xs text-red-400/80 bg-red-900/20 p-4 rounded border border-red-900/50 max-w-lg overflow-auto">
            {this.state.error?.message}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
