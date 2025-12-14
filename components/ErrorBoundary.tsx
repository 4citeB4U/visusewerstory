/* ============================================================================
LEEWAY HEADER — DO NOT REMOVE
PROFILE: LEEWAY-ORDER
TAG: CORE.ERROR.BOUNDARY.GLOBAL
REGION: 🟢 CORE

STACK: LANG=tsx; FW=react; UI=none; BUILD=node
RUNTIME: browser
TARGET: web-app

DISCOVERY_PIPELINE:
  MODEL=Voice>Intent>Location>Vertical>Ranking>Render;
  ROLE=support;
  INTENT_SCOPE=n/a;
  LOCATION_DEP=none;
  VERTICALS=n/a;
  RENDER_SURFACE=in-app;
  SPEC_REF=LEEWAY.v12.DiscoveryArchitecture

LEEWAY-LD:
{
  "@context": ["https://schema.org", {"leeway":"https://leeway.dev/ns#"}],
  "@type": "SoftwareSourceCode",
  "name": "React Error Boundary Component",
  "programmingLanguage": "TypeScript",
  "runtimePlatform": "browser",
  "about": ["LEEWAY", "React", "ErrorHandling"],
  "identifier": "CORE.ERROR.BOUNDARY.GLOBAL",
  "license": "MIT",
  "dateModified": "2025-12-09"
}

5WH: WHAT=React error boundary component; WHY=Graceful error handling for UI components; WHO=Agent Lee System; WHERE=/components/ErrorBoundary.tsx; WHEN=2025-12-09; HOW=React error boundary pattern
SPDX-License-Identifier: MIT
============================================================================ */

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="max-w-lg text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
