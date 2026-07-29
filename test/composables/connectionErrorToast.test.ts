import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToastServiceMethods } from "primevue/toastservice";
import {
  showCacheWarningToast,
  showConnectionErrorToast,
  showDownstreamConnectionErrorToast,
  showHubAdapterConnectionErrorToast,
  showHubConnectionError,
  showHubSpecificErrorMessage,
  showInvalidRobotCredentialsToast,
  showKongConnectionTestErrorToast,
  showKongConsumerConnectionErrorToast,
  showKongDuplicateErrorToast,
  showNotAuthenticatedToast,
  showProxyErrorToast,
  showRbacPermissionError,
} from "~/composables/connectionErrorToast";

function makeToast(): { add: ReturnType<typeof vi.fn> } {
  return { add: vi.fn() };
}

describe("showConnectionErrorToast", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runAllTimers(); // drain activeToasts cleanup so state is fresh per test
    vi.useRealTimers();
  });

  it("calls toast.add with the provided params and a default life of 5000ms", () => {
    const toast = makeToast();
    showConnectionErrorToast(toast as unknown as ToastServiceMethods, {
      severity: "error",
      summary: "Test Error",
      detail: "Something went wrong",
    });
    expect(toast.add).toHaveBeenCalledOnce();
    expect(toast.add).toHaveBeenCalledWith({
      severity: "error",
      summary: "Test Error",
      detail: "Something went wrong",
      life: 5000,
    });
  });

  it("uses a custom life when provided", () => {
    const toast = makeToast();
    showConnectionErrorToast(toast as unknown as ToastServiceMethods, {
      severity: "warn",
      summary: "Custom life",
      detail: "8s toast",
      life: 8000,
    });
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ life: 8000 }),
    );
  });

  it("suppresses a duplicate toast before life expires", () => {
    const toast = makeToast();
    const params = {
      severity: "warn" as const,
      summary: "Dedup test",
      detail: "same toast twice",
    };
    showConnectionErrorToast(toast as unknown as ToastServiceMethods, params);
    showConnectionErrorToast(toast as unknown as ToastServiceMethods, params);
    expect(toast.add).toHaveBeenCalledOnce();
  });

  it("allows the same toast again once life has elapsed", () => {
    const toast = makeToast();
    const params = {
      severity: "info" as const,
      summary: "Retry toast",
      detail: "retry after expiry",
      life: 1000,
    };
    showConnectionErrorToast(toast as unknown as ToastServiceMethods, params);
    vi.advanceTimersByTime(1001);
    showConnectionErrorToast(toast as unknown as ToastServiceMethods, params);
    expect(toast.add).toHaveBeenCalledTimes(2);
  });
});

describe("helper toast functions", () => {
  let toast: ReturnType<typeof makeToast>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    toast = makeToast();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("showNotAuthenticatedToast shows a Missing JWT error", () => {
    showNotAuthenticatedToast(toast as unknown as ToastServiceMethods);
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Missing JWT",
        detail: "No token was found for your account.",
      }),
    );
  });

  it("showHubAdapterConnectionErrorToast shows a generic message when no service given", () => {
    showHubAdapterConnectionErrorToast(
      toast as unknown as ToastServiceMethods,
      undefined,
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: "The API encountered an error",
      }),
    );
  });

  it("showHubAdapterConnectionErrorToast includes the service name when given", () => {
    showHubAdapterConnectionErrorToast(
      toast as unknown as ToastServiceMethods,
      "ResultService",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.stringContaining("ResultService"),
      }),
    );
  });

  it("showCacheWarningToast shows a warn severity toast", () => {
    showCacheWarningToast(toast as unknown as ToastServiceMethods);
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" }),
    );
  });

  it("showDownstreamConnectionErrorToast includes the service name and logs console.warn", () => {
    showDownstreamConnectionErrorToast(
      toast as unknown as ToastServiceMethods,
      "DataApi",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: expect.stringContaining("DataApi") }),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("DataApi"),
    );
  });

  it("showProxyErrorToast logs console.warn", () => {
    showProxyErrorToast(toast as unknown as ToastServiceMethods);
    expect(toast.add).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("showKongConnectionTestErrorToast uses life 8000 and logs console.error", () => {
    showKongConnectionTestErrorToast(
      toast as unknown as ToastServiceMethods,
      "connection refused",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        life: 8000,
        detail: expect.stringContaining("connection refused"),
      }),
    );
    expect(errorSpy).toHaveBeenCalledWith("connection refused");
  });

  it("showKongDuplicateErrorToast falls back to a default message", () => {
    showKongDuplicateErrorToast(toast as unknown as ToastServiceMethods);
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: "Conflict error",
        detail: "A data store for this project and server type already exists!",
      }),
    );
  });

  it("showKongDuplicateErrorToast uses the provided message", () => {
    showKongDuplicateErrorToast(
      toast as unknown as ToastServiceMethods,
      "Data store is linked to a different project",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: "Conflict error",
        detail: "Data store is linked to a different project",
      }),
    );
  });

  it("showKongConsumerConnectionErrorToast includes the service in the summary", () => {
    showKongConsumerConnectionErrorToast(
      toast as unknown as ToastServiceMethods,
      "FHIR",
      "timed out",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: "FHIR connection error",
        detail: "timed out",
      }),
    );
  });

  it("showInvalidRobotCredentialsToast shows an error and logs console.warn", () => {
    showInvalidRobotCredentialsToast(toast as unknown as ToastServiceMethods);
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Invalid Robot Credentials",
      }),
    );
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("showRbacPermissionError passes the message as the toast detail", () => {
    showRbacPermissionError(
      toast as unknown as ToastServiceMethods,
      "Access denied",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: "Unauthorized Error",
        detail: "Access denied",
      }),
    );
  });

  it("showHubConnectionError shows a connection error and logs console.warn", () => {
    showHubConnectionError(toast as unknown as ToastServiceMethods);
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: "Unable to contact the Hub.",
      }),
    );
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("showHubSpecificErrorMessage uses the message as both detail and console.warn", () => {
    showHubSpecificErrorMessage(
      toast as unknown as ToastServiceMethods,
      "Hub returned 502",
    );
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({ detail: "Hub returned 502" }),
    );
    expect(warnSpy).toHaveBeenCalledWith("Hub returned 502");
  });
});
