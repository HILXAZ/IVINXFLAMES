import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }

    // Send error to custom analytics
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('Error Boundary Triggered', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-600 mb-6">
                  We're sorry, but something unexpected happened. Don't worry, your data is safe.
                </p>
                
                {/* Error details for development */}
                {/* Use Vite's env replacement; avoid referencing process.env in the browser */}
                {import.meta.env && import.meta.env.MODE === 'development' && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
                    <details className="text-sm">
                      <summary className="font-medium text-red-800 cursor-pointer">
                        Error Details (Development)
                      </summary>
                      <div className="mt-2 text-red-700">
                        <strong>Error:</strong> {this.state.error.toString()}
                        <br />
                        <strong>Component Stack:</strong>
                        <pre className="mt-2 text-xs overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </button>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  <p>
                    If this problem persists, please contact support or try refreshing the page.
                  </p>
                  <p className="mt-1">
                    Your progress and data remain safe in your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
