import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  declare readonly props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Erro inesperado ao carregar a vitrine.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }

  handleRecover = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D0F] text-stone-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#16161A] border border-[#27272A] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center mx-auto font-serif-luxury text-xl font-bold">
              W
            </div>
            <h2 className="text-lg font-serif-luxury font-bold text-white">
              Atualização Necessária
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ocorreu uma instabilidade ao carregar a página. Clique abaixo para atualizar e continuar normalmente.
            </p>
            <button
              type="button"
              onClick={this.handleRecover}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C378] text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Recarregar Vitrine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
