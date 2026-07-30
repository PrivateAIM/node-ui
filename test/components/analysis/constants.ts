import { type PodLog } from "~/services/Api";
import {
  type Analysis,
  type AnalysisNode,
  AnalysisNodeApprovalStatus,
  type Node,
  ProcessStatus,
  type Project,
} from "~/services/hub";

export const fakeLogs =
  'Starting FlameCoreSDK\n\tExtracting node config\n\tConnecting to nginx...success\n\tConnecting to MessageBroker...success\n\tConnecting to ResultService...success\n\tConnecting to DataApi...success\n\tStarting FlameApi thread...success\nFlameCoreSDK ready\nINFO:     Started server process [1]\nINFO:     Waiting for application startup.\nINFO:     Application startup complete.\nINFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)\nfinished: False, False\nINFO:     10.1.30.117:44596 - "GET /healthz HTTP/1.0" 200 OK\n';

export const fakePodLogs: PodLog[] = [
  { timestamp: "2025-01-01T00:00:00Z", message: fakeLogs },
];

const fakeProjectId: string = "5833b9b8-ad5c-4db4-a3d2-297517c74511";

const fakeBaseNode: Node = {
  id: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
  createdAt: "2025-01-28T12:46:53.676000Z",
  updatedAt: "2025-03-10T14:29:28Z",
  externalName: "node-dev-5",
  name: "node-dev-5",
  hidden: false,
  type: "default",
  online: false,
  registryId: "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f",
  registry: null,
  registryProjectId: "7441bd98-10c6-49ee-8c23-78e07fd6ab11",
  registryProject: null,
  robotId: null,
  clientId: "c82d7fda-d69f-4fda-bb4c-1b2b9d910972",
  realmId: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  publicKey: null,
};

const fakeBaseProject: Project = {
  id: fakeProjectId,
  createdAt: "2025-02-05T12:08:33.131000Z",
  updatedAt: "2025-03-20T10:05:25Z",
  name: "use-case-1",
  displayName: "use-case-1",
  analyses: 4,
  realmId: fakeProjectId,
  clientId: null,
  userId: null,
  masterImageId: null,
  masterImage: null,
  description: "",
  nodes: 2,
  robotId: null,
};

const fakeBaseAnalysis: Analysis = {
  id: "832fd968-caf3-4d04-b69e-02feb66f2f86",
  createdAt: "2025-02-05T12:08:33.131000Z",
  updatedAt: "2025-03-20T10:05:25Z",
  name: "T006",
  displayName: "T006",
  nodes: 4,
  nodesApproved: 4,
  configurationLocked: true,
  configurationEntrypointValid: true,
  configurationImageValid: true,
  configurationNodeAggregatorValid: false,
  configurationNodeDefaultValid: true,
  configurationNodesValid: true,
  buildNodesValid: true,
  buildProgress: null,
  buildHash: null,
  buildOs: null,
  buildSize: null,
  buildStatus: "starting",
  registryId: "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f",
  realmId: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  clientId: null,
  userId: "5ec456e2-e30c-4a29-96de-6425fe5b9355",
  projectId: fakeProjectId,
  project: undefined,
  masterImageId: null,
  registry: null,
  masterImage: null,
  imageCommandArguments: null,
  description: null,
  distributionStatus: null,
  distributionProgress: null,
  executionStatus: null,
  executionProgress: 0,
};

export const fakeBaseAnalysisNode: AnalysisNode = {
  id: "4c4b9b2e-85de-4319-8d68-bcc8247464eb",
  createdAt: "2025-01-28T14:58:12Z",
  updatedAt: "2025-03-18T09:11:14Z",
  approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
  executionStatus: ProcessStatus.STARTED,
  executionProgress: 0,
  comment: null,
  artifactTag: null,
  artifactDigest: null,
  analysisId: "15518efa-5146-4290-a7cb-95d27f41d991",
  analysisRealmId: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  nodeId: "e3b89572-327f-4936-8cf0-fbfbcc6336b7",
  nodeRealmId: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
  analysis: fakeBaseAnalysis,
  node: fakeBaseNode,
};

export const fakeProjects = [
  {
    ...fakeBaseProject,
    id: "5833b9b8-ad5c-4db4-a3d2-297517c74511",
    name: "use-case-1",
    displayName: "use-case-1",
  },
  {
    ...fakeBaseProject,
    id: "24aabaf1-65a7-4ba9-b506-4013bc511c95",
    name: "test_bucket_unpack",
    displayName: "test_bucket_unpack",
  },
  {
    ...fakeBaseProject,
    id: "8cb0684f-8a47-4fd3-97a3-c4f7e7349687",
    name: "Test_run",
    displayName: "Test_run",
  },
  {
    ...fakeBaseProject,
    id: "cb4c0148-1dbc-49bd-9f02-396264d9b112",
    name: "node-it-fcbf0816-788e-48f0-ba22-68e86069f8ce",
    displayName: "node-it-fcbf0816-788e-48f0-ba22-68e86069f8ce",
  },
  {
    ...fakeBaseProject,
    id: "ea819933-85b4-4c90-838a-9afa7dd163ee",
    name: "UC1-basic-2025Q1",
    displayName: "UC1-basic-2025Q1",
  },
  {
    ...fakeBaseProject,
    id: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
    name: "denbi-test",
    displayName: "denbi-test",
  },
];

export const fakeAnalysisNodes: AnalysisNode[] = [
  fakeBaseAnalysisNode,
  {
    ...fakeBaseAnalysisNode,
    executionStatus: ProcessStatus.STOPPED,
    analysisId: "bd08ec3c-fc53-4c0f-990a-7ce2cc3d4744",
  },
  {
    ...fakeBaseAnalysisNode,
    executionStatus: ProcessStatus.EXECUTING,
    analysisId: "330288e9-92c6-4168-a3ac-a825a6e6a7f0",
  },
];

export const newFakeAnalysisNode: AnalysisNode = {
  ...fakeBaseAnalysisNode,
  executionStatus: ProcessStatus.EXECUTED,
  analysisId: "5d7941fa-1744-4872-a335-2b3d6d1049c7",
};
