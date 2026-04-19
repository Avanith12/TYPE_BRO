import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', background: '#2c0b0e', color: '#ff8080', fontFamily: 'monospace', height: '100vh', width: '100vw' }}>
                    <h2>Fatal React Crash</h2>
                    <p>Please send this error to the agent to fix:</p>
                    <pre style={{ background: '#000', padding: '1rem', overflow: 'auto' }}>
                        {this.state.error && this.state.error.toString()}
                        {"\n\n"}
                        {this.state.error && this.state.error.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
