import { Component } from "react";

export class EditorErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Editor crash]", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "#f5f5fb", fontFamily: "inherit" }}>
          <h2 style={{ color: "#f87171", marginBottom: 12 }}>The editor crashed</h2>
          <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>
            {String(this.state.error?.message || "Unknown render error")}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "10px 24px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Try to recover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
