// For spoofing requests not made using the useFetch
import { http, HttpResponse } from "msw";
import {
  type BodyKongInitializeKongInitializePost,
  type BodyPodorcPodsCreatePoPost,
  type CleanupPodResponse,
} from "../../app/services/Api";
import {
  fakeDataStoreInitSuccess,
  fakeParsedProjects,
} from "../components/data-stores/constants";
import { fakeProposalsResp } from "../components/projects/constants";

export const fakeValidProposalId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const fakeInvalidProposalId = "15518efa-5146-4290-a7cb-95d27f41d991";

export const fakeAnalysisId = "15518efa-5146-4290-a7cb-95d27f41d991";
export const fakeMissingAnalysisId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const fakeBrokenAnalysisId = "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa";
export const fakeInvalidRoleAnalysisId = "1a29aee7-538b-4a02-9fab-b184b1dcdc2a";

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

  // Node settings (used by various components during setup)
  http.get("/node/settings", () => {
    return HttpResponse.json({
      status: 200,
      data: {
        data_required: false,
      },
    });
  }),

  http.post("/analysis/initialize", async ({ request }) => {
    const formData = await request.formData();
    const analysisId = formData.get("analysis_id");

    if (analysisId === fakeAnalysisId) {
      return HttpResponse.json({
        [fakeAnalysisId]: "started",
      });
    } else if (analysisId === fakeBrokenAnalysisId) {
      return HttpResponse.json(
        { detail: { service: "PO" } },
        {
          status: 500,
        },
      );
    } else if (analysisId === fakeMissingAnalysisId) {
      return new HttpResponse(undefined, { status: 404 });
    } else if (analysisId === fakeInvalidRoleAnalysisId) {
      return HttpResponse.json(
        { detail: { service: "Auth" } },
        {
          status: 403,
        },
      );
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
  http.get(`/po/logs/${fakeAnalysisId}`, () => {
    return HttpResponse.json({
      status: 200,
      data: {
        analysis: {
          [fakeAnalysisId]: ["Starting FlameCoreSDK"],
        },
        nginx: {
          [fakeAnalysisId]: [
            "/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty",
          ],
        },
      },
    });
  }),

  http.get(`/po/history/${fakeAnalysisId}`, () => {
    return HttpResponse.json({
      status: 200,
      data: {
        analysis: {
          [fakeAnalysisId]: ["Starting FlameCoreSDK"],
        },
        nginx: {
          [fakeAnalysisId]: [
            "/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty",
          ],
        },
      },
    });
  }),

  // Working analysis controls
  http.post(`/po`, async ({ request }) => {
    const body = (await request.json()) as BodyPodorcPodsCreatePoPost;
    const analysisId = body.analysis_id;
    if (analysisId === fakeAnalysisId) {
      return HttpResponse.json({
        [fakeAnalysisId]: "started",
      });
    } else {
      return HttpResponse.json(undefined, {
        status: 503,
      });
    }
  }),
  http.put(`/po/stop/${fakeAnalysisId}`, () => {
    return HttpResponse.json({
      [fakeAnalysisId]: "stopped",
    });
  }),
  http.delete(`/analysis/terminate/${fakeAnalysisId}`, () => {
    return HttpResponse.json({
      [fakeAnalysisId]: "stopped",
    });
  }),

  // Update Analysis Button - running analysis TODO remove
  http.get(`/po/status/${fakeAnalysisId}`, () => {
    return HttpResponse.json({
      [fakeAnalysisId]: "running",
    });
  }),

  http.get(`/po/status`, () => {
    return HttpResponse.json({
      [fakeAnalysisId]: "running",
    });
  }),

  // Update Analysis Button - no running analyses TODO remove
  http.get(`/po/status/${fakeMissingAnalysisId}`, () => {
    return HttpResponse.json({});
  }),

  // Update Analysis Button - broken TODO remove
  http.get(`/po/status/${fakeBrokenAnalysisId}`, () => {
    return HttpResponse.json({}, { status: 500 });
  }),

  // Broken analysis controls
  http.put(`/po/stop/${fakeBrokenAnalysisId}`, () => {
    return HttpResponse.json({}, { status: 500 });
  }),
  http.delete(`/analysis/terminate/${fakeBrokenAnalysisId}`, () => {
    return HttpResponse.json({}, { status: 500 });
  }),

  // Missing analysis controls
  http.put(`/po/stop/${fakeMissingAnalysisId}`, () => {
    return HttpResponse.json({});
  }),
  http.delete(`/analysis/terminate/${fakeMissingAnalysisId}`, () => {
    return HttpResponse.json({});
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
    return HttpResponse.json(undefined, {
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
          destinations: undefined,
          headers: undefined,
          hosts: undefined,
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
          snis: undefined,
          sources: undefined,
          strip_path: true,
          tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "fhir"],
          updated_at: 1749192126,
        },
      ],
      offset: undefined,
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
    const body = (await request.json()) as BodyKongInitializeKongInitializePost;
    const projectId = body.project_id;
    const hostname = body.datastore["host"];

    const validProjectId = fakeParsedProjects[0]!.id;
    const duplicateProjectId = fakeParsedProjects[1]!.id;

    if (hostname === "void") {
      // Trigger for an error
      return new HttpResponse(undefined, { status: 500 });
    } else if (projectId === validProjectId) {
      return HttpResponse.json(fakeDataStoreInitSuccess);
    } else if (projectId === duplicateProjectId) {
      return new HttpResponse(undefined, { status: 409 });
    } else {
      return new HttpResponse(undefined, { status: 500 });
    }
  }),
];
