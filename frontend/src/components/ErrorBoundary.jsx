import { Component } from 'react';
import { Home, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Wire up your error tracking here (e.g. Sentry.captureException(error))
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠</span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 font-mono bg-navy-700 border border-navy-500 rounded-xl p-3 text-left break-words">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={this.handleReload} className="btn-secondary">
              <RefreshCw size={15} /> Reload page
            </button>
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="btn-primary"
            >
              <Home size={15} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
