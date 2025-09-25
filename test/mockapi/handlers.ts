// For spoofing requests not made using the useFetch
import { http, HttpResponse } from "msw";
import {
  type BodyCreateAnalysisPoPost,
  type CleanupPodResponse,
} from "~/services/Api";
import {
  fakeDataStoreInitSuccess,
  fakeParsedProjects,
} from "~/test/components/data-stores/constants";
import type { kongBody } from "~/components/data-stores/create/DataStoreProjectInitializer.vue";
import { fakeProposalsResp } from "~/test/components/projects/constants";

export const fakeValidProposalId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const fakeInvalidProposalId = "15518efa-5146-4290-a7cb-95d27f41d991";

export const fakeAnalysisId = "15518efa-5146-4290-a7cb-95d27f41d991";
export const fakeMissingAnalysisId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const fakeBrokenAnalysisId = "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa";

export const handlers = [
  // Node-type
  http.get("/node-type", () => {
    return HttpResponse.json({
      status: 200,
      data: {
        type: "default",
      },
    });
  }),

  http.post("/analysis/initialize", async ({ request }) => {
    const formData = await request.formData();
    const analysisId = formData.get("analysis_id");

    if (analysisId === fakeAnalysisId) {
      return HttpResponse.json({
        status: "started",
      });
    } else if (analysisId === fakeBrokenAnalysisId) {
      return new HttpResponse(null, { status: 500 });
    } else if (analysisId === fakeMissingAnalysisId) {
      return new HttpResponse(null, { status: 404 });
    }
  }),

  // Project approval/rejection
  http.post("/project-nodes/*", ({ request }) => {
    const url = new URL(request.url);
    const pid = url.pathname.split("/")[2];
    if (pid === fakeValidProposalId) {
      return HttpResponse.json(fakeProposalsResp[0]);
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
      return HttpResponse.json(null, {
        status: 503,
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

  // Update Analysis Button - running analysis TODO remove
  http.get(`/po/${fakeAnalysisId}/status`, () => {
    return HttpResponse.json({
      status: {
        "analysis-15518efa-5146-4290-a7cb-95d27f41d9913518": "running",
        "analysis-15518efa-5146-4290-a7cb-95d27f41d9918148": "stopped",
      },
    });
  }),

  // Update Analysis Button - no running analyses TODO remove
  http.get(`/po/${fakeMissingAnalysisId}/status`, () => {
    return HttpResponse.json({
      status: {},
    });
  }),

  // Update Analysis Button - broken TODO remove
  http.get(`/po/${fakeBrokenAnalysisId}/status`, () => {
    return HttpResponse.error();
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

  // PO Cleanup Endpoints
  http.delete(`/po/cleanup/all`, () => {
    const cleanupResp: CleanupPodResponse = {
      all: "Valid response",
      analyzes: "",
      mb: "",
      rs: "",
      services: "",
      zombies: "",
    };
    return HttpResponse.json(cleanupResp);
  }),

  http.delete(`/po/cleanup/analyzes`, () => {
    const cleanupResp: CleanupPodResponse = {
      all: "",
      analyzes: "Valid response",
      mb: "",
      rs: "",
      services: "",
      zombies: "",
    };
    return HttpResponse.json(cleanupResp);
  }),

  http.delete(`/po/cleanup/mb`, () => {
    const cleanupResp: CleanupPodResponse = {
      all: "",
      analyzes: "",
      mb: "Valid response",
      rs: "",
      services: "",
      zombies: "",
    };
    return HttpResponse.json(cleanupResp);
  }),

  // Error test
  http.delete(`/po/cleanup/rs`, () => {
    return HttpResponse.json(null, {
      status: 503,
    });
  }),

  http.delete(`/po/cleanup/services`, () => {
    const cleanupResp: CleanupPodResponse = {
      all: "",
      analyzes: "",
      mb: "",
      rs: "",
      services: "Valid response",
      zombies: "",
    };
    return HttpResponse.json(cleanupResp);
  }),

  // Kong
  http.delete(`/kong/analysis/*`, () => {
    return HttpResponse.text("200");
  }),
  http.get(`/kong/project`, () => {
    return HttpResponse.json({
      data: [
        {
          created_at: 1749192126,
          destinations: null,
          headers: null,
          hosts: null,
          https_redirect_status_code: 426,
          id: "ca6ba716-3e3a-4841-a9c3-0db732a74cd9",
          methods: ["GET"],
          name: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483-fhir",
          path_handling: "v0",
          paths: ["/7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483-fhir/fhir"],
          preserve_host: false,
          protocols: ["http"],
          regex_priority: 0,
          request_buffering: true,
          response_buffering: true,
          service: {
            id: "1b7bc86e-fe14-4e15-ade5-4187183aad46",
          },
          snis: null,
          sources: null,
          strip_path: true,
          tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "fhir"],
          updated_at: 1749192126,
        },
      ],
      offset: null,
    });
  }),
  http.post(`/kong/analysis`, () => {
    return HttpResponse.json({
      consumer: {
        created_at: 1746525117,
        custom_id: "2923b3c1-e92f-4540-92cc-8595865b72b7-flame",
        id: "2e21e380-ddfa-4605-9a77-ab35ae4696b9",
        tags: ["7ecec11f-6db0-425d-81cf-4c4b043f5c27"],
        username: "2923b3c1-e92f-4540-92cc-8595865b72b7-flame",
      },
      keyauth: {
        consumer: {
          id: "2e21e380-ddfa-4605-9a77-ab35ae4696b9",
        },
        created_at: 1746525117,
        id: "fd130816-da9b-4a38-b7b3-c0b758d36276",
        key: "8TzlwgmVuXXovFCcD2tqOQwEUPkq7OmH",
        tags: ["7ecec11f-6db0-425d-81cf-4c4b043f5c27"],
      },
      acl: {
        consumer: {
          id: "2e21e380-ddfa-4605-9a77-ab35ae4696b9",
        },
        created_at: 1746525117,
        id: "1ef5b933-9d02-41f7-bab7-518c0c1fceea",
        group: "7ecec11f-6db0-425d-81cf-4c4b043f5c27",
        tags: ["7ecec11f-6db0-425d-81cf-4c4b043f5c27"],
      },
    });
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
