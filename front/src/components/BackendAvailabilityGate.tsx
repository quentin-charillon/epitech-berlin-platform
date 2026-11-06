import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BackendAvailabilityError,
  getBackendBaseUrl,
  waitForBackend,
  type BackendAvailabilityFailure,
} from "../utils/backendAvailability";

type GateState = "checking" | "ready" | "failed";

export default function BackendAvailabilityGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [failure, setFailure] = useState<BackendAvailabilityFailure>("timeout");
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const retry = useCallback(() => {
    controllerRef.current?.abort();
    setState("checking");
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    waitForBackend(getBackendBaseUrl(), { signal: controller.signal })
      .then(() => setState("ready"))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setFailure(error instanceof BackendAvailabilityError ? error.reason : "timeout");
        setState("failed");
      });

    return () => controller.abort();
  }, [attempt]);

  if (state === "ready") return children;

  return (
    <main className="backend-wake-screen">
      <div className="backend-wake-glow backend-wake-glow--one" aria-hidden="true" />
      <div className="backend-wake-glow backend-wake-glow--two" aria-hidden="true" />
      <section className="backend-wake-card" aria-labelledby="backend-wake-title">
        <div className="backend-wake-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="backend-wake-eyebrow">EPITECH BERLIN</p>
        <h1 id="backend-wake-title">
          {state === "checking"
            ? "Preparing your Berlin experience..."
            : "The server is temporarily unavailable"}
        </h1>
        <p className="backend-wake-copy">
          {state === "checking"
            ? "Our server is waking up. This may take up to three minutes."
            : failure === "configuration"
              ? "The server responded, but its availability check is not configured correctly. Please try again later."
              : "The server did not respond within three minutes. Please try again."}
        </p>
        {state === "checking" ? (
          <div className="backend-wake-status" role="status" aria-live="polite">
            <span className="backend-wake-spinner" aria-hidden="true" />
            <span>Connecting to the platform</span>
          </div>
        ) : (
          <button className="backend-wake-retry" type="button" onClick={retry}>
            Retry
          </button>
        )}
      </section>
    </main>
  );
}
