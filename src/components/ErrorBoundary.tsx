'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-terminal-bg text-terminal-green p-8">
          <div className="border border-terminal-border p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">[ERROR]</h1>
            <p className="mb-4">Something went wrong. Please refresh the page.</p>
            <pre className="text-sm opacity-70 overflow-auto">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
