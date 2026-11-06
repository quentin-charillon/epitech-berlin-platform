export const BACKEND_WAKE_TIMEOUT_MS = 180_000;
export const BACKEND_REQUEST_TIMEOUT_MS = 12_000;
export const BACKEND_RETRY_DELAY_MS = 5_000;

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

export type BackendAvailabilityFailure = "timeout" | "configuration";

export class BackendAvailabilityError extends Error {
  reason: BackendAvailabilityFailure;
  status?: number;

  constructor(reason: BackendAvailabilityFailure, message: string, status?: number) {
    super(message);
    this.name = "BackendAvailabilityError";
    this.reason = reason;
    this.status = status;
  }
}

type WaitOptions = {
  fetchImpl?: typeof fetch;
  totalTimeoutMs?: number;
  requestTimeoutMs?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
};

function abortError() {
  return new DOMException("The backend availability check was cancelled", "AbortError");
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function getBackendBaseUrl() {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3001";
}

export async function waitForBackend(
  baseUrl = getBackendBaseUrl(),
  options: WaitOptions = {},
): Promise<void> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const totalTimeoutMs = options.totalTimeoutMs ?? BACKEND_WAKE_TIMEOUT_MS;
  const requestTimeoutMs = options.requestTimeoutMs ?? BACKEND_REQUEST_TIMEOUT_MS;
  const retryDelayMs = options.retryDelayMs ?? BACKEND_RETRY_DELAY_MS;
  const startedAt = Date.now();

  while (Date.now() - startedAt < totalTimeoutMs) {
    if (options.signal?.aborted) throw abortError();

    const remaining = totalTimeoutMs - (Date.now() - startedAt);
    const requestController = new AbortController();
    const cancelRequest = () => requestController.abort();
    options.signal?.addEventListener("abort", cancelRequest, { once: true });
    const requestTimer = window.setTimeout(
      () => requestController.abort(),
      Math.min(requestTimeoutMs, remaining),
    );

    try {
      const response = await fetchImpl(`${baseUrl}/api/health/ready`, {
        method: "GET",
        cache: "no-store",
        signal: requestController.signal,
      });

      if (response.ok) return;
      if (!RETRYABLE_STATUSES.has(response.status)) {
        throw new BackendAvailabilityError(
          "configuration",
          `The readiness endpoint returned HTTP ${response.status}.`,
          response.status,
        );
      }
    } catch (error) {
      if (error instanceof BackendAvailabilityError) throw error;
      if (options.signal?.aborted) throw abortError();
      // Network failures and per-request timeouts are temporary while Render wakes.
    } finally {
      window.clearTimeout(requestTimer);
      options.signal?.removeEventListener("abort", cancelRequest);
    }

    const afterRequestRemaining = totalTimeoutMs - (Date.now() - startedAt);
    if (afterRequestRemaining <= 0) break;
    await delay(Math.min(retryDelayMs, afterRequestRemaining), options.signal);
  }

  throw new BackendAvailabilityError(
    "timeout",
    "The backend did not become ready before the wake-up deadline.",
  );
}
