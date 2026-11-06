import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackendAvailabilityError, waitForBackend } from "./backendAvailability";

const ready = () => new Response(null, { status: 200 });
const unavailable = () => new Response(null, { status: 503 });

describe("waitForBackend", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("resolves immediately when the backend is ready", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ready());

    await waitForBackend("https://api.example", { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/api/health/ready",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("retries temporary failures and succeeds after several attempts", async () => {
    const fetchImpl = vi.fn()
      .mockRejectedValueOnce(new TypeError("network error"))
      .mockResolvedValueOnce(unavailable())
      .mockResolvedValueOnce(ready());
    const result = waitForBackend("https://api.example", { fetchImpl });

    await vi.advanceTimersByTimeAsync(10_000);

    await expect(result).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("can succeed after more than 120 seconds", async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => (++calls === 26 ? ready() : unavailable()));
    const result = waitForBackend("https://api.example", { fetchImpl });

    await vi.advanceTimersByTimeAsync(125_000);

    await expect(result).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledTimes(26);
  });

  it("fails after the 180 second global deadline", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(unavailable());
    const result = waitForBackend("https://api.example", { fetchImpl });
    const rejection = expect(result).rejects.toMatchObject({ reason: "timeout" });

    await vi.advanceTimersByTimeAsync(180_000);

    await rejection;
  });

  it("never has more than one request active", async () => {
    let active = 0;
    let maximumActive = 0;
    let calls = 0;
    const fetchImpl = vi.fn(() => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      return new Promise<Response>((resolve) => {
        window.setTimeout(() => {
          active -= 1;
          calls += 1;
          resolve(calls === 3 ? ready() : unavailable());
        }, 1_000);
      });
    });
    const result = waitForBackend("https://api.example", { fetchImpl });

    await vi.advanceTimersByTimeAsync(13_000);

    await expect(result).resolves.toBeUndefined();
    expect(maximumActive).toBe(1);
  });

  it("aborts the active request and clears timers when cancelled", async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn((_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      }),
    );
    const result = waitForBackend("https://api.example", {
      fetchImpl: fetchImpl as typeof fetch,
      signal: controller.signal,
    });

    controller.abort();

    await expect(result).rejects.toMatchObject({ name: "AbortError" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([401, 403])("does not retry definitive HTTP %s errors", async (status) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status }));

    await expect(waitForBackend("https://api.example", { fetchImpl })).rejects.toEqual(
      expect.objectContaining<Partial<BackendAvailabilityError>>({
        reason: "configuration",
        status,
      }),
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("uses the legacy health endpoint once when the readiness route is missing", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(ready());

    await expect(waitForBackend("https://api.example", { fetchImpl })).resolves.toBeUndefined();

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://api.example/api/health",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("reports a configuration error when both health endpoints are missing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));

    await expect(waitForBackend("https://api.example", { fetchImpl })).rejects.toMatchObject({
      reason: "configuration",
      status: 404,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("only issues GET requests and never retries a write operation", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(unavailable())
      .mockResolvedValueOnce(ready());
    const result = waitForBackend("https://api.example", { fetchImpl });

    await vi.advanceTimersByTimeAsync(5_000);
    await result;

    expect(fetchImpl.mock.calls.every(([, init]) => init?.method === "GET")).toBe(true);
  });
});
