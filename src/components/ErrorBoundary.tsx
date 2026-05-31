import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-950 text-white p-8 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Algo deu errado na renderização (Tela Preta Evitada)</h1>
          <p className="mb-4 font-mono text-sm max-w-3xl bg-black/50 p-4 rounded-xl border border-red-500/30 overflow-auto">
            {this.state.error?.toString()}
          </p>
          <pre className="text-xs text-red-300 bg-black/80 p-4 rounded-xl max-w-4xl overflow-auto text-left">
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold"
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
