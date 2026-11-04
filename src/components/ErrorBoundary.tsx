import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  details: string | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '', details: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let parsedMessage = error.message || 'An unexpected error occurred.';
    let details: string | null = null;
    try {
      const maybeFirestore = JSON.parse(error.message);
      if (maybeFirestore && maybeFirestore.operationType) {
        parsedMessage = `Database permission or validation error during ${maybeFirestore.operationType} on ${maybeFirestore.path || 'collection'}.`;
        details = maybeFirestore.error || null;
      }
    } catch {
      // Plain non-JSON error
    }
    return {
      hasError: true,
      message: parsedMessage,
      details,
    };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('IHR OSINT ErrorBoundary caught:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h2 className="text-base font-semibold">Application Recovery Notice</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{this.state.message}</p>
            {this.state.details && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-400">
                {this.state.details}
              </pre>
            )}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload Academy</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
