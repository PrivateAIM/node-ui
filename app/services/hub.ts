/**
 * FLAME Hub domain types.
 *
 * These come from the Hub's own published packages instead of from the generated
 * `Api.ts`. The hub-adapter forwards hub entities through unchanged — its FastAPI
 * `response_model`s *are* `flame-hub-client`'s models — so the Hub, not the
 * adapter's OpenAPI document, is the source of truth for their shape.
 *
 * Everything genuinely owned by the node — kong, pod-orchestrator, events, logs,
 * node settings, health, auth — still comes from `~/services/Api`.
 *
 * Note that the adapter strips the Hub's `{ data, meta }` envelope: collection
 * endpoints answer with a bare array and record endpoints with a bare object.
 * That is why only the entity types are imported here and not
 * `@privateaim/core-http-kit`'s client or its `EntityRecordResponse` /
 * `EntityCollectionResponse` wrappers.
 */

export type {
  Analysis,
  AnalysisBucket,
  AnalysisBucketFile,
  AnalysisNode,
  MasterImage,
  MasterImageCommandArgument,
  MasterImageGroup,
  Node,
  Project,
  ProjectNode,
  Registry,
  RegistryProject,
} from "@privateaim/core-kit";

/**
 * The adapter's `DetailedAnalysis` is hub's `Analysis` with its relations
 * included. Kept as a distinct name so the call sites that ask the adapter for
 * an included `project` stay self-documenting.
 */
export type { Analysis as DetailedAnalysis } from "@privateaim/core-kit";

export {
  AnalysisBucketType,
  AnalysisNodeApprovalStatus,
  NodeType,
  ProjectNodeApprovalStatus,
  RegistryProjectType,
} from "@privateaim/core-kit";

/**
 * Build, distribution and execution status share one enum in the Hub. Note this
 * is the *Hub's* view of an analysis — the pod-orchestrator reports its own
 * lifecycle through `PodStatus` in `~/services/Api`, and the two are not
 * interchangeable.
 */
export { ProcessStatus } from "@privateaim/kit";
