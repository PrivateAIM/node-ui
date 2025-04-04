// For spoofing requests not made using the useFetch
import { http, HttpResponse } from "msw";
import { type BodyCreateAnalysisPoPost } from "~/services/Api";
import {
  fakeDataStoreInitSuccess,
  fakeParsedProjects,
} from "~/test/components/data-stores/constants";
import type { kongBody } from "~/components/data-stores/managers/DataStoreProjectInitializer.vue";
import { fakeProposalsResp } from "~/test/components/projects/constants";

export const fakeValidProposalId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const fakeInvalidProposalId = "15518efa-5146-4290-a7cb-95d27f41d991";

export const fakeAnalysisId = "15518efa-5146-4290-a7cb-95d27f41d991";
export const fakeMissingAnalysisId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const fakeBrokenAnalysisId = "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa";

export const handlers = [
  // Project approval/rejection
  http.post("/project-nodes/*", ({ request }) => {
    const url = new URL(request.url);
    const pid = url.pathname.split("/")[2];
    if (pid === fakeValidProposalId) {
      return HttpResponse.json(fakeProposalsResp.data[0]);
    } else if (pid === fakeInvalidProposalId) {
      return HttpResponse.json({
        status: 500,
        data: fakeProposalsResp[0],
      });
    }
  }),
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
  // Working analysis controls
  http.post(`/po`, async ({ request }) => {
    const body = (await request.json()) as BodyCreateAnalysisPoPost;
    const analysisId = body.analysis_id;
    if (analysisId === fakeAnalysisId) {
      return HttpResponse.json({
        status: "started",
      });
    } else {
      return HttpResponse.json({
        detail: {
          message:
            "HTTP Request: POST http://flame-node-po-service:8000/po - HTTP Status: 503 - Service is unavailable. Check the PodOrc service at http://flame-node-po-service:8000",
          service: "PodOrc",
        },
      });
    }
  }),
  http.put(`/po/${fakeAnalysisId}/stop`, () => {
    return HttpResponse.json({
      status: {
        "analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": "stopped",
        "analysis-15518efa-5146-4290-a7cb-95d27f41d9918148": "stopped",
      },
    });
  }),
  http.delete(`/po/${fakeAnalysisId}/delete`, () => {
    return HttpResponse.json({
      status: {
        "analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": "stopped",
        "analysis-15518efa-5146-4290-a7cb-95d27f41d9918148": "stopped",
      },
    });
  }),
  // Broken analysis controls
  http.put(`/po/${fakeBrokenAnalysisId}/*`, () => {
    return HttpResponse.json({
      detail: {
        message:
          "HTTP Request: PUT http://flame-node-po-service:8000/po/15518efa-5146-4290-a7cb-95d27f41d991/stop - HTTP Status: 503 - Service is unavailable. Check the PodOrc service at http://flame-node-po-service:8000",
        service: "PodOrc",
      },
    });
  }),
  http.delete(`/po/${fakeBrokenAnalysisId}/*`, () => {
    return HttpResponse.json({
      detail: {
        message:
          "HTTP Request: PUT http://flame-node-po-service:8000/po/15518efa-5146-4290-a7cb-95d27f41d991/stop - HTTP Status: 503 - Service is unavailable. Check the PodOrc service at http://flame-node-po-service:8000",
        service: "PodOrc",
      },
    });
  }),
  // Missing analysis controls
  http.put(`/po/${fakeMissingAnalysisId}/stop`, () => {
    return HttpResponse.json({
      status: {},
    });
  }),
  http.delete(`/po/${fakeMissingAnalysisId}/delete`, () => {
    return HttpResponse.json({
      status: {},
    });
  }),
  // Kong
  http.delete(`/kong/analysis/*`, () => {
    return HttpResponse.text("200");
  }),
  http.post(`/kong/analysis`, () => {
    return HttpResponse.text("200");
  }),
  http.post(`/kong/initialize`, async ({ request }) => {
    const body = (await request.json()) as kongBody;
    const projectId = body.project_id;
    const dsType = body.ds_type;

    const validProjectId = fakeParsedProjects[0].id;
    const duplicateProjectId = fakeParsedProjects[1].id;

    if (dsType === "s3") {
      // s3 is my trigger for an error
      return new HttpResponse(null, { status: 500 });
    } else if (projectId === validProjectId) {
      return HttpResponse.json(fakeDataStoreInitSuccess);
    } else if (projectId === duplicateProjectId) {
      return new HttpResponse(null, { status: 409 });
    } else {
      return new HttpResponse(null, { status: 500 });
    }
  }),
];
