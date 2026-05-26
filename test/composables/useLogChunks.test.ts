import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { testServer } from "@/test/mockapi/setup";
import { useLogChunks } from "~/composables/useLogChunks";
import type { AnalysisLogsResponse, PodLog } from "~/services/Api";

const ANALYSIS_ID = "test-analysis-123";

const makePodLog = (
  message: string,
  timestamp = "2024-01-01T00:00:00Z",
): PodLog => ({
  timestamp,
  message,
  level: "INFO",
  stacktrace: null,
});

// Each log gets a unique timestamp (base + index seconds) so the dedup filter
// in loadOlderChunk (which removes logs matching the boundary timestamp) doesn't
// accidentally drop an entire chunk when all logs share the same timestamp.
function makeTimestamp(secondsOffset: number): string {
  return new Date(
    Date.UTC(2024, 0, 1) + secondsOffset * 1000,
  ).toISOString();
}

function makeLogsResponse(
  count: number,
  messageOffset = 0,
): AnalysisLogsResponse {
  return {
    analysis_id: ANALYSIS_ID,
    run_number: 1,
    nginx_logs: Array.from({ length: count }, (_, i) =>
      makePodLog(
        `nginx-${messageOffset + i}`,
        makeTimestamp(messageOffset + i),
      ),
    ),
    analysis_logs: Array.from({ length: count }, (_, i) =>
      makePodLog(
        `analysis-${messageOffset + i}`,
        makeTimestamp(messageOffset + i),
      ),
    ),
  };
}

function setupLogsHandler(analysisId: string, count: number) {
  testServer.use(
    http.get(`/logs/${analysisId}`, ({ request }) => {
      const url = new URL(request.url, "http://localhost");
      const limit = Number(url.searchParams.get("limit") ?? count);
      return HttpResponse.json(makeLogsResponse(Math.min(limit, count)));
    }),
  );
}

describe("useLogChunks", () => {
  describe("initialize", () => {
    it("loads first chunk and sets lines", async () => {
      setupLogsHandler(ANALYSIS_ID, 5);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      expect(chunks.nginxLines.value).toHaveLength(5);
      expect(chunks.analysisLines.value).toHaveLength(5);
      expect(chunks.nginxLines.value[0]!.content).toBe("nginx-0");
    });

    it("sets hasOlder true when chunk is full (300 returned)", async () => {
      setupLogsHandler(ANALYSIS_ID, 300);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      expect(chunks.hasOlder.value).toBe(true);
    });

    it("sets hasOlder false when fewer than 300 returned", async () => {
      setupLogsHandler(ANALYSIS_ID, 50);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      expect(chunks.hasOlder.value).toBe(false);
    });

    it("sets initialized true after successful fetch", async () => {
      setupLogsHandler(ANALYSIS_ID, 5);
      const chunks = useLogChunks(ANALYSIS_ID);
      expect(chunks.initialized.value).toBe(false);
      await chunks.initialize();
      expect(chunks.initialized.value).toBe(true);
    });

    it("sets runNumber from the response", async () => {
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () =>
          HttpResponse.json({
            analysis_id: ANALYSIS_ID,
            run_number: 7,
            nginx_logs: [],
            analysis_logs: [],
          }),
        ),
      );
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      expect(chunks.runNumber.value).toBe(7);
    });

    it("sets httpError to 403 when server returns 403", async () => {
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () =>
          HttpResponse.json({ detail: "forbidden" }, { status: 403 }),
        ),
      );
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      expect(chunks.httpError.value).toBe(403);
    });
  });

  describe("loadOlderChunk", () => {
    it("prepends older chunk before existing lines", async () => {
      let callCount = 0;
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () => {
          callCount++;
          // First call (initialize): returns newer 300 logs (message offsets 300-599)
          // Second call (loadOlderChunk): returns older 300 logs (message offsets 0-299)
          return HttpResponse.json(
            makeLogsResponse(300, callCount === 1 ? 300 : 0),
          );
        }),
      );

      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      await chunks.loadOlderChunk();

      expect(chunks.nginxLines.value).toHaveLength(600);
      // Older chunk prepended: index 0 is from the older batch
      expect(chunks.nginxLines.value[0]!.content).toBe("nginx-0");
      // Original lines follow
      expect(chunks.nginxLines.value[300]!.content).toBe("nginx-300");
    });

    it("sets hasOlder false when second chunk is partial", async () => {
      let callCount = 0;
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () => {
          callCount++;
          // First call: 300 logs at offsets 50-349 (boundary = T+50s)
          // Second call: 50 logs at offsets 0-49 (all < boundary → no dedup)
          return HttpResponse.json(
            callCount === 1
              ? makeLogsResponse(300, 50)
              : makeLogsResponse(50, 0),
          );
        }),
      );

      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      await chunks.loadOlderChunk();

      expect(chunks.hasOlder.value).toBe(false);
      expect(chunks.nginxLines.value).toHaveLength(350);
    });

    it("does not fetch when hasOlder is false", async () => {
      setupLogsHandler(ANALYSIS_ID, 50); // partial → hasOlder=false
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      const lineCountBefore = chunks.nginxLines.value.length;
      await chunks.loadOlderChunk();
      expect(chunks.nginxLines.value).toHaveLength(lineCountBefore);
    });
  });

  describe("initialize guard", () => {
    it("ignores a concurrent initialize call while one is already in progress", async () => {
      let callCount = 0;
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, async () => {
          callCount++;
          return HttpResponse.json(makeLogsResponse(5));
        }),
      );
      const chunks = useLogChunks(ANALYSIS_ID);
      // Fire two calls without awaiting between them; second should be a no-op
      const p1 = chunks.initialize();
      const p2 = chunks.initialize();
      await Promise.all([p1, p2]);
      expect(callCount).toBe(1);
      expect(chunks.nginxLines.value).toHaveLength(5);
    });
  });

  describe("oldestTimestamp selection", () => {
    it("picks analysis timestamp when it is older than nginx timestamp", async () => {
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () =>
          HttpResponse.json({
            analysis_id: ANALYSIS_ID,
            run_number: 1,
            nginx_logs: [makePodLog("nginx-0", "2024-01-01T00:01:00Z")],
            analysis_logs: [makePodLog("analysis-0", "2024-01-01T00:00:00Z")],
          }),
        ),
      );
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      expect(chunks.oldestTimestamp.value).toBe("2024-01-01T00:00:00Z");
    });

    it("picks nginx timestamp when it is older than analysis timestamp", async () => {
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () =>
          HttpResponse.json({
            analysis_id: ANALYSIS_ID,
            run_number: 1,
            nginx_logs: [makePodLog("nginx-0", "2024-01-01T00:00:00Z")],
            analysis_logs: [makePodLog("analysis-0", "2024-01-01T00:01:00Z")],
          }),
        ),
      );
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      expect(chunks.oldestTimestamp.value).toBe("2024-01-01T00:00:00Z");
    });

    it("returns null when both log arrays are empty", async () => {
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () =>
          HttpResponse.json({
            analysis_id: ANALYSIS_ID,
            run_number: 1,
            nginx_logs: [],
            analysis_logs: [],
          }),
        ),
      );
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      expect(chunks.oldestTimestamp.value).toBeNull();
    });
  });

  describe("appendPolled", () => {
    it("appends new polled logs to the end without changing hasOlder", async () => {
      setupLogsHandler(ANALYSIS_ID, 5);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      const polledResponse: AnalysisLogsResponse = {
        analysis_id: ANALYSIS_ID,
        run_number: 1,
        nginx_logs: [makePodLog("new-nginx")],
        analysis_logs: [makePodLog("new-analysis")],
      };
      chunks.appendPolled(polledResponse);

      expect(chunks.nginxLines.value).toHaveLength(6);
      expect(chunks.nginxLines.value[5]!.content).toBe("new-nginx");
      expect(chunks.hasOlder.value).toBe(false); // unchanged
    });
  });

  describe("reset", () => {
    it("clears all state", async () => {
      setupLogsHandler(ANALYSIS_ID, 5);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      chunks.reset();

      expect(chunks.nginxLines.value).toHaveLength(0);
      expect(chunks.analysisLines.value).toHaveLength(0);
      expect(chunks.hasOlder.value).toBe(false);
      expect(chunks.initialized.value).toBe(false);
      expect(chunks.runNumber.value).toBeNull();
    });
  });
});
