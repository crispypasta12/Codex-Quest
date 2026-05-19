"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Loop Forest crashed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="game-error">
          <h3>Loop Forest needs a refresh.</h3>
          <p>The lesson hit an unexpected error. Reloading the page should restore your saved progress.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
