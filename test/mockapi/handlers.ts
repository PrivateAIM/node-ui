// For spoofing requests not made using the useFetch
import { http, HttpResponse } from "msw";

export const fakeAnalysisId = "15518efa-5146-4290-a7cb-95d27f41d991";

export const handlers = [
  // Analysis logs
  http.get("/po/85629f5b-da04-4f7c-84fc-097b2db93de5/history", () => {
    return HttpResponse.json({
      status: 200,
      data: {
        analysis: {
          "analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": [
            "Starting FlameCoreSDK",
          ],
        },
        nginx: {
          "nginx-analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": [
            "/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty",
          ],
        },
      },
    });
  }),
  http.put(`/po/${fakeAnalysisId}/stop`, () => {
    return HttpResponse.json({
      status: 200,
      data: {
        status: {
          "analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": "stopped",
        },
      },
    });
  }),
  http.put(`/po/${fakeAnalysisId}/delete`, () => {
    return HttpResponse.json({
      status: 200,
      data: {
        status: {
          "analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": "stopped",
          "analysis-15518efa-5146-4290-a7cb-95d27f41d9918148": "stopped",
        },
      },
    });
  }),
];
