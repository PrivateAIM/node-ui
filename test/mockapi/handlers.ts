import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/po/85629f5b-da04-4f7c-84fc-097b2db93de5/logs", () => {
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
];
