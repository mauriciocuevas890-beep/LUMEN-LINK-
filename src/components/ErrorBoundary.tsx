import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isChunkError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Detect dynamic import or chunk loading failures
    const isChunk =
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('Loading chunk');

    return {
      hasError: true,
      error,
      isChunkError: isChunk,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary captured rendering error:', error, errorInfo);

    // If it's a chunk error from a new deploy, attempt automatic reload once
    if (this.state.isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_reload_timestamp');
      const now = Date.now();
      // Allow 1 auto-reload every 15 seconds
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('chunk_reload_timestamp', now.toString());
        window.location.reload();
      }
    }
  }

  private handleRetry = () => {
    try {
      sessionStorage.removeItem('chunk_reload_timestamp');
    } catch (_) {}
    this.setState({ hasError: false, error: null, isChunkError: false });
    window.location.reload();
  };

  private handleGoHome = () => {
    try {
      sessionStorage.removeItem('chunk_reload_timestamp');
    } catch (_) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen-dvh w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-sky-500 selection:text-white">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {this.state.isChunkError
                  ? 'Actualización disponible'
                  : 'Algo no salió como esperábamos'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {this.state.isChunkError
                  ? 'Se ha detectado una nueva versión de la aplicación o una pequeña interrupción en tu conexión de datos.'
                  : 'Hubo una pausa temporal al procesar la información. Pulsa el botón para volver a intentar.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700/80 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Ir al inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
