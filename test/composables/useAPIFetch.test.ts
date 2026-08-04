import { describe, expect, it, vi } from "vitest";
import { useFetch } from "nuxt/app";
import { getServiceHealthHistory } from "~/composables/useAPIFetch";
import { fakeServiceHealthHistory } from "../components/uptime/constants";

describe("getServiceHealthHistory", () => {
  it("resolves the payload itself rather than an async-data handle", async () => {
    const history = await getServiceHealthHistory({
      start_date: "2026-07-30T12:00:00.000Z",
      end_date: "2026-07-30T13:00:00.000Z",
    });

    expect(history.services).toEqual(fakeServiceHealthHistory.services);
  });

  it("Use fetch to call", async () => {
    vi.mocked(useFetch).mockClear();

    await getServiceHealthHistory({ include_checks: true });
    expect(useFetch).not.toHaveBeenCalled();
  });
});
