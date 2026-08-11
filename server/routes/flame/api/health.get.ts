import { createProxy } from "node-fetch-native/proxy";

// Keep under 3500ms (next-auth default)
const TIMEOUT_MS = Number(process.env.NUXT_IDP_HEALTH_TIMEOUT_MS ?? 3000);

function describeFetchError(error: unknown): string {
  if (!(error instanceof Error)) return String(error); // Catch when not proper Error
  if (error.name === "TimeoutError")
    return `no response within ${TIMEOUT_MS}ms`;
  return error.cause instanceof Error ? error.cause.message : error.message;
}

export default defineEventHandler(async () => {
  const clientIssuer =
    process.env.NUXT_PUBLIC_IDP_ISSUER ?? "http://localhost:8080/realms/flame";
  const wellKnown = `${clientIssuer.replace(/\/$/, "")}/.well-known/openid-configuration`;

  try {
    const response = await fetch(wellKnown, {
      ...(createProxy() as RequestInit),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    // Response was received
    if (!response.ok) {
      console.warn(`IDP discovery returned ${response.status}: ${wellKnown}`);
      return {
        reachable: false,
        error: `The identity provider responded with ${response.status}`,
      };
    }

    return { reachable: true };
  } catch (error) {
    // try and parse error message for toast
    const message = describeFetchError(error);
    console.error(`IDP discovery unreachable at ${wellKnown}:`, message, error);
    return { reachable: false, error: message };
  }
});
