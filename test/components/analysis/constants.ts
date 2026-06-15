import {
  type Analysis,
  type AnalysisNode,
  type Node,
  type PodLog,
  type Project,
} from "~/services/Api";

export const fakeLogs =
  'Starting FlameCoreSDK\n\tExtracting node config\n\tConnecting to nginx...success\n\tConnecting to MessageBroker...success\n\tConnecting to ResultService...success\n\tConnecting to DataApi...success\n\tStarting FlameApi thread...success\nFlameCoreSDK ready\nINFO:     Started server process [1]\nINFO:     Waiting for application startup.\nINFO:     Application startup complete.\nINFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)\nfinished: False, False\nINFO:     10.1.30.117:44596 - "GET /healthz HTTP/1.0" 200 OK\n';

export const fakePodLogs: PodLog[] = [
  { timestamp: "2025-01-01T00:00:00Z", message: fakeLogs },
];

const fakeProjectId: string = "5833b9b8-ad5c-4db4-a3d2-297517c74511";

const fakeBaseNode: Node = {
  id: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
  created_at: "2025-01-28T12:46:53.676000Z",
  updated_at: "2025-03-10T14:29:28Z",
  external_name: "node-dev-5",
  name: "node-dev-5",
  hidden: false,
  type: "default",
  online: false,
  registry_id: "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f",
  registry_project_id: "7441bd98-10c6-49ee-8c23-78e07fd6ab11",
  robot_id: null,
  client_id: "c82d7fda-d69f-4fda-bb4c-1b2b9d910972",
  realm_id: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  public_key: null,
};

const fakeBaseProject: Project = {
  id: fakeProjectId,
  created_at: "2025-02-05T12:08:33.131000Z",
  updated_at: "2025-03-20T10:05:25Z",
  name: "use-case-1",
  display_name: "use-case-1",
  analyses: 4,
  realm_id: fakeProjectId,
  user_id: null,
  master_image_id: null,
  master_image: null,
  description: "",
  nodes: 2,
  robot_id: null,
};

const fakeBaseAnalysis: Analysis = {
  id: "832fd968-caf3-4d04-b69e-02feb66f2f86",
  created_at: "2025-02-05T12:08:33.131000Z",
  updated_at: "2025-03-20T10:05:25Z",
  name: "T006",
  display_name: "T006",
  nodes: 4,
  nodes_approved: 4,
  configuration_locked: true,
  configuration_entrypoint_valid: true,
  configuration_image_valid: true,
  configuration_node_aggregator_valid: false,
  configuration_node_default_valid: true,
  configuration_nodes_valid: true,
  build_nodes_valid: true,
  build_progress: null,
  build_hash: null,
  build_os: null,
  build_size: null,
  build_status: "starting",
  registry_id: "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f",
  realm_id: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  user_id: "5ec456e2-e30c-4a29-96de-6425fe5b9355",
  project_id: fakeProjectId,
  project: undefined,
  master_image_id: null,
  registry: null,
  master_image: null,
  description: null,
  distribution_status: null,
  distribution_progress: null,
  execution_status: null,
  execution_progress: 0,
};

export const fakeBaseAnalysisNode: AnalysisNode = {
  id: "4c4b9b2e-85de-4319-8d68-bcc8247464eb",
  created_at: "2025-01-28T14:58:12Z",
  updated_at: "2025-03-18T09:11:14Z",
  approval_status: "approved",
  execution_status: "started",
  execution_progress: 0,
  comment: null,
  artifact_tag: null,
  artifact_digest: null,
  analysis_id: "15518efa-5146-4290-a7cb-95d27f41d991",
  analysis_realm_id: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  node_id: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
  node_realm_id: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  analysis: fakeBaseAnalysis,
  node: fakeBaseNode,
};

export const fakeProjects = [
  {
    ...fakeBaseProject,
    id: "5833b9b8-ad5c-4db4-a3d2-297517c74511",
    name: "use-case-1",
    display_name: "use-case-1",
  },
  {
    ...fakeBaseProject,
    id: "24aabaf1-65a7-4ba9-b506-4013bc511c95",
    name: "test_bucket_unpack",
    display_name: "test_bucket_unpack",
  },
  {
    ...fakeBaseProject,
    id: "8cb0684f-8a47-4fd3-97a3-c4f7e7349687",
    name: "Test_run",
    display_name: "Test_run",
  },
  {
    ...fakeBaseProject,
    id: "cb4c0148-1dbc-49bd-9f02-396264d9b112",
    name: "node-it-fcbf0816-788e-48f0-ba22-68e86069f8ce",
    display_name: "node-it-fcbf0816-788e-48f0-ba22-68e86069f8ce",
  },
  {
    ...fakeBaseProject,
    id: "ea819933-85b4-4c90-838a-9afa7dd163ee",
    name: "UC1-basic-2025Q1",
    display_name: "UC1-basic-2025Q1",
  },
  {
    ...fakeBaseProject,
    id: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
    name: "denbi-test",
    display_name: "denbi-test",
  },
];

export const fakeAnalysisNodes: AnalysisNode[] = [
  fakeBaseAnalysisNode,
  {
    ...fakeBaseAnalysisNode,
    execution_status: "stopped",
    analysis_id: "bd08ec3c-fc53-4c0f-990a-7ce2cc3d4744",
  },
  {
    ...fakeBaseAnalysisNode,
    execution_status: "executing",
    analysis_id: "330288e9-92c6-4168-a3ac-a825a6e6a7f0",
  },
];

export const newFakeAnalysisNode: AnalysisNode = {
  ...fakeBaseAnalysisNode,
  execution_status: "executed",
  analysis_id: "5d7941fa-1744-4872-a335-2b3d6d1049c7",
};
