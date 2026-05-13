import React from 'react';
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(_) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (<div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
            <p className="text-muted-foreground mb-6">We're sorry for the inconvenience. Please try refreshing the page.</p>
            <button className="btn-primary px-6 py-2 rounded-xl" onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
