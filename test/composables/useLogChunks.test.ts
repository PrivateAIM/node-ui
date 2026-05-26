import { describe, expect, it, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { testServer } from "@/test/mockapi/setup";
import { useLogChunks } from "~/composables/useLogChunks";
import type { AnalysisLogsResponse, PodLog } from "~/services/Api";

const ANALYSIS_ID = "test-analysis-123";

const makePodLog = (message: string, timestamp = "2024-01-01T00:00:00Z"): PodLog => ({
  timestamp,
  message,
  level: "INFO",
  stacktrace: null,
});

function makeLogsResponse(
  count: number,
  messageOffset = 0,
): AnalysisLogsResponse {
  return {
    analysis_id: ANALYSIS_ID,
    run_number: 1,
    nginx_logs: Array.from({ length: count }, (_, i) =>
      makePodLog(`nginx-${messageOffset + i}`),
    ),
    analysis_logs: Array.from({ length: count }, (_, i) =>
      makePodLog(`analysis-${messageOffset + i}`),
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
      expect(chunks.nginxLines.value[0].content).toBe("nginx-0");
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
          return HttpResponse.json(makeLogsResponse(300, callCount === 1 ? 300 : 0));
        }),
      );

      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      await chunks.loadOlderChunk();

      expect(chunks.nginxLines.value).toHaveLength(600);
      // Older chunk prepended: index 0 is from the older batch
      expect(chunks.nginxLines.value[0].content).toBe("nginx-0");
      // Original lines follow
      expect(chunks.nginxLines.value[300].content).toBe("nginx-300");
    });

    it("sets hasOlder false when second chunk is partial", async () => {
      let callCount = 0;
      testServer.use(
        http.get(`/logs/${ANALYSIS_ID}`, () => {
          callCount++;
          return HttpResponse.json(makeLogsResponse(callCount === 1 ? 300 : 50));
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
      expect(chunks.nginxLines.value[5].content).toBe("new-nginx");
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
