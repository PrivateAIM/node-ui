import { describe, expect, it, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { testServer } from "@/test/mockapi/setup";
import { useLogChunks } from "~/composables/useLogChunks";
import type { AnalysisLogsResponse, PodLog } from "~/services/Api";

const ANALYSIS_ID = "test-analysis-123";

const makePodLog = (message: string): PodLog => ({
  timestamp: "2024-01-01T00:00:00Z",
  message,
  level: "INFO",
  stacktrace: null,
});

function makeLogsResponse(
  count: number,
  offset = 0,
): AnalysisLogsResponse {
  return {
    analysis_id: ANALYSIS_ID,
    run_number: 1,
    nginx_logs: Array.from({ length: count }, (_, i) =>
      makePodLog(`nginx-${offset + i}`),
    ),
    analysis_logs: Array.from({ length: count }, (_, i) =>
      makePodLog(`analysis-${offset + i}`),
    ),
  };
}

function setupLogsHandler(
  analysisId: string,
  chunkSize: number,
  totalLogs: number,
) {
  testServer.use(
    http.get(`/logs/${analysisId}`, ({ request }) => {
      const url = new URL(request.url, "http://localhost");
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const limit = Number(url.searchParams.get("limit") ?? totalLogs);
      const remaining = Math.max(0, totalLogs - offset);
      const count = Math.min(limit, remaining);
      return HttpResponse.json(makeLogsResponse(count, offset));
    }),
  );
}

describe("useLogChunks", () => {
  describe("initialize", () => {
    it("loads first chunk and sets lines", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 5);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      expect(chunks.nginxLines.value).toHaveLength(5);
      expect(chunks.analysisLines.value).toHaveLength(5);
      expect(chunks.nginxLines.value[0].content).toBe("nginx-0");
    });

    it("sets hasMore true when chunk is full (300 returned)", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 600);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      expect(chunks.hasMore.value).toBe(true);
    });

    it("sets hasMore false when fewer than 300 returned", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 50);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();

      expect(chunks.hasMore.value).toBe(false);
    });

    it("sets initialized true after successful fetch", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 5);
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

  describe("loadNextChunk", () => {
    it("appends next chunk to existing lines", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 600);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      await chunks.loadNextChunk();

      expect(chunks.nginxLines.value).toHaveLength(600);
      expect(chunks.nginxLines.value[300].content).toBe("nginx-300");
    });

    it("sets hasMore false when second chunk is partial", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 350);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      await chunks.loadNextChunk();

      expect(chunks.hasMore.value).toBe(false);
      expect(chunks.nginxLines.value).toHaveLength(350);
    });

    it("does not fetch when hasMore is false", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 50);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      const lineCountBefore = chunks.nginxLines.value.length;
      await chunks.loadNextChunk(); // hasMore is false, should no-op
      expect(chunks.nginxLines.value).toHaveLength(lineCountBefore);
    });
  });

  describe("appendPolled", () => {
    it("appends new polled logs to the end without changing offset or hasMore", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 5);
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
      expect(chunks.hasMore.value).toBe(false); // unchanged
    });
  });

  describe("reset", () => {
    it("clears all state", async () => {
      setupLogsHandler(ANALYSIS_ID, 300, 5);
      const chunks = useLogChunks(ANALYSIS_ID);
      await chunks.initialize();
      chunks.reset();

      expect(chunks.nginxLines.value).toHaveLength(0);
      expect(chunks.analysisLines.value).toHaveLength(0);
      expect(chunks.hasMore.value).toBe(false);
      expect(chunks.initialized.value).toBe(false);
      expect(chunks.runNumber.value).toBeNull();
    });
  });
});
