/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * ServiceTag
 * Service tags
 */
export enum ServiceTag {
  Auth = "Auth",
  Autostart = "Autostart",
  KongCleanup = "Kong Cleanup",
  Logs = "Logs",
  Health = "Health",
  Hub = "Hub",
  HubAdapter = "Hub Adapter",
  Kong = "Kong",
  Meta = "Meta",
  Node = "Node",
  PodOrc = "PodOrc",
  Storage = "Storage",
  IDP = "IDP",
  Unknown = "Unknown",
}

/**
 * ServiceMonitoringStatus
 * Whether a downstream service is being monitored on this node.
 */
export enum ServiceMonitoringStatus {
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
}

/**
 * ServiceCheckStatus
 * Outcome of a single recorded probe. Only these two values are ever stored.
 */
export enum ServiceCheckStatus {
  OK = "OK",
  ERROR = "ERROR",
}

/**
 * ProtocolCode
 * Protocol codes.
 */
export enum ProtocolCode {
  Http = "http",
  Grpc = "grpc",
  Grpcs = "grpcs",
  Tls = "tls",
  Tcp = "tcp",
}

/**
 * PodStatus
 * Custom PO run statuses.
 */
export enum PodStatus {
  Starting = "starting",
  Started = "started",
  Stopping = "stopping",
  Stopped = "stopped",
  Executing = "executing",
  Executed = "executed",
  Stuck = "stuck",
  Failed = "failed",
}

/**
 * HttpMethodCode
 * HTTP method codes.
 */
export enum HttpMethodCode {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  CONNECT = "CONNECT",
  TRACE = "TRACE",
  CUSTOM = "CUSTOM",
}

/**
 * HealthStatus
 * Health of a service as reported by a live probe.
 */
export enum HealthStatus {
  OK = "OK",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

/**
 * DataStoreType
 * Data store types.
 */
export enum DataStoreType {
  S3 = "s3",
  Fhir = "fhir",
}

/**
 * CleanUpType
 * Canned strings for cleanup endpoint
 */
export enum CleanUpType {
  All = "all",
  Analyzes = "analyzes",
  Services = "services",
  Mb = "mb",
  Rs = "rs",
  Keycloak = "keycloak",
  Zombies = "zombies",
}

/**
 * ACL
 * ACL entities are used to control access to a resource. An ACL can be applied to a Consumer
 */
export interface ACL {
  consumer?: ACLConsumer | null;
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /** Id */
  id?: string | null;
  /**
   * Group
   * The group that this ACL represents.
   */
  group?: string | null;
  /**
   * Tags
   * An optional set of strings associated with the ACL for grouping and filtering.
   */
  tags?: string[] | null;
}

/**
 * ACLConsumer
 * The Consumer to which this ACL is associated. A Consumer can have many ACLs.
 */
export interface ACLConsumer {
  /** Id */
  id?: string | null;
}

/** Analysis */
export interface Analysis {
  /** Description */
  description: string | null;
  /** Name */
  name: string | null;
  /** Displayname */
  displayName: string | null;
  /**
   * Projectid
   * @format uuid
   */
  projectId: string;
  /** Masterimageid */
  masterImageId: string | null;
  /** Registryid */
  registryId: string | null;
  /** Imagecommandarguments */
  imageCommandArguments?: MasterImageCommandArgument[];
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Nodes */
  nodes: number;
  /** Nodesapproved */
  nodesApproved: number;
  /** Configurationlocked */
  configurationLocked: boolean;
  /** Configurationentrypointvalid */
  configurationEntrypointValid: boolean;
  /** Configurationimagevalid */
  configurationImageValid: boolean;
  /** Configurationnodeaggregatorvalid */
  configurationNodeAggregatorValid: boolean;
  /** Configurationnodedefaultvalid */
  configurationNodeDefaultValid: boolean;
  /** Configurationnodesvalid */
  configurationNodesValid: boolean;
  /** Buildstatus */
  buildStatus:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Distributionnodesvalid */
  distributionNodesValid: boolean;
  /** Buildprogress */
  buildProgress: number | null;
  /** Buildhash */
  buildHash: string | null;
  /** Buildos */
  buildOs: string | null;
  /** Buildsize */
  buildSize: number | null;
  /** Distributionstatus */
  distributionStatus:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Distributionprogress */
  distributionProgress: number | null;
  /** Executionstatus */
  executionStatus:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Executionprogress */
  executionProgress: number | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
  registry?: Registry | null;
  /**
   * Realmid
   * @format uuid
   */
  realmId: string;
  /**
   * Userid
   * @format uuid
   */
  userId: string;
  /** Clientid */
  clientId: string | null;
  project?: Project | null;
  masterImage?: MasterImage | null;
}

/**
 * AnalysisLogHistoryResponse
 * Logs for all runs of an analysis.
 */
export interface AnalysisLogHistoryResponse {
  /**
   * Analysis Id
   * @format uuid
   */
  analysis_id: string;
  /** Runs */
  runs: RunLogs[];
}

/**
 * AnalysisLogsResponse
 * Latest logs for an analysis (most recent run).
 */
export interface AnalysisLogsResponse {
  /**
   * Analysis Id
   * @format uuid
   */
  analysis_id: string;
  /** Run Number */
  run_number: number;
  /** Nginx Logs */
  nginx_logs: PodLog[];
  /** Analysis Logs */
  analysis_logs: PodLog[];
}

/** AnalysisNode */
export interface AnalysisNode {
  /**
   * Analysisid
   * @format uuid
   */
  analysisId: string;
  /**
   * Nodeid
   * @format uuid
   */
  nodeId: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Approvalstatus */
  approvalStatus: "rejected" | "approved" | null;
  /** Executionstatus */
  executionStatus:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Executionprogress */
  executionProgress: number | null;
  /** Comment */
  comment: string | null;
  /** Artifacttag */
  artifactTag: string | null;
  /** Artifactdigest */
  artifactDigest: string | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
  analysis?: Analysis | null;
  node?: Node | null;
  /**
   * Analysisrealmid
   * @format uuid
   */
  analysisRealmId: string;
  /**
   * Noderealmid
   * @format uuid
   */
  nodeRealmId: string;
}

/**
 * AnalysisStatus
 * Status report for an analysis from the PodOrchestrator
 */
export interface AnalysisStatus {
  /** Custom PO run statuses. */
  status: PodStatus;
  /** Progress */
  progress?: number | null;
}

/**
 * ApiRequestCountResponse
 * Response for the API request count endpoint.
 *
 * data maps endpoint path → {method: count, ..., "total": count}.
 */
export interface ApiRequestCountResponse {
  /** Total */
  total: number;
  /** Data */
  data: Record<string, Record<string, number>>;
}

/**
 * AutostartSettings
 * Autostart Settings.
 */
export interface AutostartSettings {
  /**
   * Enabled
   * @default false
   */
  enabled?: boolean | null;
  /**
   * Interval
   * @default 60
   */
  interval?: number | null;
}

/** Body_get_token_token_post */
export interface BodyGetTokenTokenPost {
  /**
   * Username
   * IDP username
   */
  username: string;
  /**
   * Password
   * IDP password
   */
  password: string;
}

/** Body_kong_initialize_kong_initialize_post */
export interface BodyKongInitializeKongInitializePost {
  /**
   * Project Id
   * UUID of the project
   */
  project_id: string;
  /**
   * Protocols
   * List of acceptable transfer protocols. A combo of 'http', 'grpc', 'grpcs', 'tls', 'tcp'
   * @default ["http"]
   */
  protocols?: ProtocolCode[];
  /**
   * Methods
   * List of acceptable HTTP methods
   */
  methods?: HttpMethodCode[] | null;
  /**
   * Data store metadata.
   * Required information for creating a new data store.
   */
  datastore: ServiceRequest;
  /** Data store type. Either 's3' or 'fhir' */
  ds_type: DataStoreType;
  /** S3 configuration */
  s3_config?: S3Config | null;
}

/** Body_podorc_pods_create_po_post */
export interface BodyPodorcPodsCreatePoPost {
  /**
   * Analysis Id
   * Analysis UUID
   */
  analysis_id: string;
  /**
   * Project Id
   * Project UUID
   */
  project_id: string;
  /**
   * Kong Token
   * Analysis keyauth kong token
   */
  kong_token?: string;
  /**
   * Node Id
   * Node UUID
   */
  node_id: string;
}

/**
 * CleanupPodResponse
 * Response model for cleanup endpoint
 */
export interface CleanupPodResponse {
  /** All */
  all?: string | null;
  /** Analyzes */
  analyzes?: string | null;
  /** Services */
  services?: string | null;
  /** Mb */
  mb?: string | null;
  /** Rs */
  rs?: string | null;
  /** Zombies */
  zombies?: string | null;
}

/**
 * CreateServiceRequestClientCertificate
 * Certificate to be used as client certificate while TLS handshaking to the upstream server. With form-encoded, the notation is `client_certificate.id=<client_certificate id>`. With JSON, use `"client_certificate":{"id":"<client_certificate id>"}`.
 */
export interface CreateServiceRequestClientCertificate {
  /** Id */
  id?: string | null;
}

/**
 * DetailedRoute
 * Custom route response model with associated services.
 */
export interface DetailedRoute {
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /**
   * Destinations
   * A list of IP destinations of incoming connections that match this route when using stream routing. Each entry is an object with fields "ip" (optionally in CIDR range notation) and/or "port".
   */
  destinations?: RouteDestinationsInner[] | null;
  /**
   * Headers
   * One or more lists of values indexed by header name that will cause this route to match if present in the request. The `Host` header cannot be used with this hosts should be specified using the `hosts` attribute. When `headers` contains only one value and that value starts with the special prefix `~*`, the value is interpreted as a regular expression.
   */
  headers?: Record<string, any> | null;
  /**
   * Hosts
   * A list of domain names that match this route. Note that the hosts value is case sensitive.
   */
  hosts?: string[] | null;
  /**
   * Https Redirect Status Code
   * The status code Kong responds with when all properties of a route match except the protocol i.e. if the protocol of the request is `HTTP` instead of `HTTPS`. `Location` header is injected by Kong if the field is set to 301, 302, 307 or 308. This config applies only if the route is configured to only accept the `https` protocol.
   * @default 426
   */
  https_redirect_status_code?: number | null;
  /** Id */
  id?: string | null;
  /**
   * Methods
   * A list of HTTP methods that match this route.
   */
  methods?: string[] | null;
  /**
   * Name
   * The name of the route. Route names must be unique, and they are case sensitive. For example, there can be two different routes named "test" and "Test".
   */
  name?: string | null;
  /**
   * Path Handling
   * Controls how the service path, route path and requested path are combined when sending a request to the upstream. See above for a detailed description of each behavior.
   * @default "v0"
   */
  path_handling?: string | null;
  /**
   * Paths
   * A list of paths that match this route.
   */
  paths?: string[] | null;
  /**
   * Preserve Host
   * When matching a route via one of the `hosts` domain names, use the request `Host` header in the upstream request headers. If set to `false`, the upstream `Host` header will be that of the services `host`.
   * @default false
   */
  preserve_host?: boolean | null;
  /**
   * Protocols
   * An array of the protocols this route should allow. See the [route Object](#route-object) section for a list of accepted protocols. When set to only `"https"`, HTTP requests are answered with an upgrade error. When set to only `"http"`, HTTPS requests are answered with an error.
   */
  protocols?: string[] | null;
  /**
   * Regex Priority
   * A number used to choose which route resolves a given request when several routes match it using regexes simultaneously. When two routes match the path and have the same `regex_priority`, the older one (lowest `created_at`) is used. Note that the priority for non-regex routes is different (longer non-regex routes are matched before shorter ones).
   * @default 0
   */
  regex_priority?: number | null;
  /**
   * Request Buffering
   * Whether to enable request body buffering or not. With HTTP 1.1, it may make sense to turn this off on services that receive data with chunked transfer encoding.
   * @default true
   */
  request_buffering?: boolean | null;
  /**
   * Response Buffering
   * Whether to enable response body buffering or not. With HTTP 1.1, it may make sense to turn this off on services that send data with chunked transfer encoding.
   * @default true
   */
  response_buffering?: boolean | null;
  /** Service */
  service?: Service | RouteService | null;
  /**
   * Snis
   * A list of SNIs that match this route when using stream routing.
   */
  snis?: string[] | null;
  /**
   * Sources
   * A list of IP sources of incoming connections that match this route when using stream routing. Each entry is an object with fields "ip" (optionally in CIDR range notation) and/or "port".
   */
  sources?: RouteDestinationsInner[] | null;
  /**
   * Strip Path
   * When matching a route via one of the `paths`, strip the matching prefix from the upstream request URL.
   * @default true
   */
  strip_path?: boolean | null;
  /**
   * Tags
   * An optional set of strings associated with the route for grouping and filtering.
   */
  tags?: string[] | null;
  /**
   * Updated At
   * Unix epoch when the resource was last updated.
   */
  updated_at?: number | null;
}

/**
 * DetailedService
 * Custom route response model with associated services.
 */
export interface DetailedService {
  /**
   * Ca Certificates
   * Array of `CA Certificate` object UUIDs that are used to build the trust store while verifying upstream server's TLS certificate. If set to `null` when Nginx default is respected. If default CA list in Nginx are not specified and TLS verification is enabled, then handshake with upstream server will always fail (because no CA are trusted).
   */
  ca_certificates?: string[] | null;
  client_certificate?: ServiceClientCertificate | null;
  /**
   * Connect Timeout
   * The timeout in milliseconds for establishing a connection to the upstream server.
   * @default 60000
   */
  connect_timeout?: number | null;
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /**
   * Enabled
   * Whether the service is active. If set to `false`, the proxy behavior will be as if any routes attached to it do not exist (404).
   * @default true
   */
  enabled?: boolean | null;
  /**
   * Host
   * The host of the upstream server. Note that the host value is case sensitive.
   */
  host?: string | null;
  /** Id */
  id?: string | null;
  /**
   * Name
   * The service name.
   */
  name?: string | null;
  /**
   * Path
   * The path to be used in requests to the upstream server.
   */
  path?: string | null;
  /**
   * Port
   * The upstream server port.
   * @default 80
   */
  port?: number | null;
  /**
   * Protocol
   * The protocol used to communicate with the upstream.
   * @default "http"
   */
  protocol?: string | null;
  /**
   * Read Timeout
   * The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server.
   * @default 60000
   */
  read_timeout?: number | null;
  /**
   * Retries
   * The number of retries to execute upon failure to proxy.
   * @default 5
   */
  retries?: number | null;
  /**
   * Tags
   * An optional set of strings associated with the service for grouping and filtering.
   */
  tags?: string[] | null;
  /**
   * Tls Verify
   * Whether to enable verification of upstream server TLS certificate. If set to `null`, then the Nginx default is respected.
   */
  tls_verify?: boolean | null;
  /**
   * Tls Verify Depth
   * Maximum depth of chain while verifying Upstream server's TLS certificate. If set to `null`, then the Nginx default is respected.'
   */
  tls_verify_depth?: number | null;
  /**
   * Updated At
   * Unix epoch when the resource was last updated.
   */
  updated_at?: number | null;
  /**
   * Url
   * Helper field to set `protocol`, `host`, `port` and `path` using a URL. This field is write-only and is not returned in responses.
   */
  url?: string | null;
  /**
   * Write Timeout
   * The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server.
   * @default 60000
   */
  write_timeout?: number | null;
  /**
   * Routes
   * @default []
   */
  routes?: Route[] | null;
}

/**
 * DownstreamHealthCheck
 * Response model for downstream health checks.
 */
export interface DownstreamHealthCheck {
  /** Response model to validate and return when performing a health check. */
  po: HealthCheck;
  /** Response model to validate and return when performing a health check. */
  storage: HealthCheck;
  /** Response model to validate and return when performing a health check. */
  hub_core: HealthCheck;
  /** Response model to validate and return when performing a health check. */
  hub_auth: HealthCheck;
  /** Response model to validate and return when performing a health check. */
  idp: HealthCheck;
  /** Response model to validate and return when performing a health check. */
  kong: HealthCheck;
  victoria_logs?: HealthCheck | null;
  message_broker?: HealthCheck | null;
  s3?: HealthCheck | null;
  fhir?: HealthCheck | null;
}

/**
 * EventLog
 * Event log response model.
 */
export interface EventLog {
  /** Image */
  image: string;
  /** Component */
  component: string;
  /** Event Name */
  event_name: string;
  /** Service tags */
  service: ServiceTag;
  /** Level */
  level: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Message */
  message: string;
  /** User */
  user?: string | null;
}

/**
 * EventLogResponse
 * Event log response model.
 */
export interface EventLogResponse {
  /** Data */
  data: EventLog[];
  /** Event log metadata model. */
  meta: Meta;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/**
 * HealthCheck
 * Response model to validate and return when performing a health check.
 */
export interface HealthCheck {
  /** Health of a service as reported by a live probe. */
  status: HealthStatus;
  /** Status Code */
  status_code?: number | null;
  /** Message */
  message?: string | null;
  /** Latency Ms */
  latency_ms?: number | null;
}

/** InitializeAnalysis */
export interface InitializeAnalysis {
  /** Analysis Id */
  analysis_id: string;
  /** Project Id */
  project_id: string;
}

/**
 * KeyAuth
 * A Key-auth entity represents a key used to authenticate consumers with the key-auth plugin. The key-auth plugin is used to protect API endpoints by requiring a secret key to be sent with the request.
 */
export interface KeyAuth {
  consumer?: KeyAuthConsumer | null;
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /** Id */
  id?: string | null;
  /**
   * Key
   * The key that will be used to authenticate the consumer. If this field is not specified, it will be auto-generated.
   */
  key?: string | null;
  /**
   * Tags
   * An optional set of strings associated with the Key for grouping and filtering.
   */
  tags?: string[] | null;
}

/**
 * KeyAuthConsumer
 * The Consumer to which this Key is associated. A Consumer can have many Key-auth credentials.
 */
export interface KeyAuthConsumer {
  /** Id */
  id?: string | null;
}

/**
 * KongCleanupSettings
 * Settings for the background sweep that deletes Kong analysis consumers once their analysis reaches a terminal
 * status.
 */
export interface KongCleanupSettings {
  /**
   * Interval
   * @default 600
   */
  interval?: number | null;
}

/** LinkDataStoreProject */
export interface LinkDataStoreProject {
  /** Route entities define rules to match client requests. Every request matching a given route will be proxied to its associated service. */
  route: Route;
  /** A Key-auth entity represents a key used to authenticate consumers with the key-auth plugin. The key-auth plugin is used to protect API endpoints by requiring a secret key to be sent with the request. */
  keyauth: KeyAuth;
  /** ACL entities are used to control access to a resource. An ACL can be applied to a Consumer */
  acl: ACL;
}

/**
 * ListRoutes
 * Custom route list response model.
 */
export interface ListRoutes {
  /** Data */
  data?: DetailedRoute[] | null;
  /**
   * Offset
   * Offset is used to paginate through the API. Provide this value to the next list operation to fetch the next page
   */
  offset?: string | null;
}

/**
 * ListServices
 * Custom route list response model.
 */
export interface ListServices {
  /** Data */
  data?: DetailedService[] | null;
  /**
   * Offset
   * Offset is used to paginate through the API. Provide this value to the next list operation to fetch the next page
   */
  offset?: string | null;
}

/**
 * LogQLQueryRequest
 * Request body for a raw LogQL query.
 */
export interface LogQLQueryRequest {
  /** Query */
  query: string;
  /**
   * Limit
   * @default 50
   */
  limit?: number;
  /**
   * Offset
   * @default 0
   */
  offset?: number;
  /** Start */
  start?: string | null;
  /** End */
  end?: string | null;
}

/**
 * LogQLQueryResponse
 * Response for a raw LogQL query.
 */
export interface LogQLQueryResponse {
  /** Data */
  data: Record<string, any>[];
  /** Event log metadata model. */
  meta: Meta;
}

/** MasterImage */
export interface MasterImage {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Path */
  path: string | null;
  /** Virtualpath */
  virtualPath: string;
  /** Groupvirtualpath */
  groupVirtualPath: string;
  /** Buildstatus */
  buildStatus:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Buildprogress */
  buildProgress: number | null;
  /** Name */
  name: string;
  /** Command */
  command: string | null;
  /** Commandarguments */
  commandArguments: MasterImageCommandArgument[] | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** MasterImageCommandArgument */
export interface MasterImageCommandArgument {
  /** Value */
  value: string;
  /** Position */
  position: "before" | "after" | null;
}

/**
 * Meta
 * Event log metadata model.
 */
export interface Meta {
  /** Count */
  count: number;
  /** Total */
  total: number;
  /** Limit */
  limit: number;
  /** Offset */
  offset?: number | null;
}

/** NetStatResponse */
export interface NetStatResponse {
  /** Data */
  data: NetStatTotal[];
  /** Event log metadata model. */
  meta: Meta;
}

/** NetStatRun */
export interface NetStatRun {
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Container */
  container: string;
  /** Run Number */
  run_number: number;
  /** Pod */
  pod: string;
  /** Bytes In */
  bytes_in: number;
  /** Bytes Out */
  bytes_out: number;
}

/** NetStatTotal */
export interface NetStatTotal {
  /**
   * Analysis Id
   * @format uuid
   */
  analysis_id: string;
  /** Bytes In */
  bytes_in: number;
  /** Bytes Out */
  bytes_out: number;
  /** Runs */
  runs: NetStatRun[];
}

/** Node */
export interface Node {
  /** Externalname */
  externalName: string | null;
  /** Hidden */
  hidden: boolean | null;
  /** Name */
  name: string;
  /** Realmid */
  realmId: string | null;
  /** Registryid */
  registryId: string | null;
  /** Type */
  type: "aggregator" | "default" | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Publickey */
  publicKey: string | null;
  /** Online */
  online: boolean;
  registry?: Registry | null;
  /** Registryprojectid */
  registryProjectId: string | null;
  registryProject?: RegistryProject | null;
  /** Clientid */
  clientId: string | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** NodeTypeResponse */
export interface NodeTypeResponse {
  /** Type */
  type: "aggregator" | "default";
}

/**
 * PodLog
 * A single log line from a pod container.
 */
export interface PodLog {
  /** Timestamp */
  timestamp: string;
  /** Message */
  message: string;
  /** Level */
  level?: string | null;
  /** Stacktrace */
  stacktrace?: string | null;
}

/**
 * PodProgressResponse
 * Response with dynamic UUID keys and dynamic analysis keys with progress/status
 */
export type PodProgressResponse = Partial<Record<any, AnalysisStatus>>;

/**
 * PodResponse
 * Response with a list of running pods for a given analysis ID
 */
export type PodResponse = Partial<Record<any, (string | null)[]>>;

/** Project */
export interface Project {
  /** Description */
  description: string | null;
  /** Masterimageid */
  masterImageId: string | null;
  /** Name */
  name: string;
  /** Displayname */
  displayName: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Analyses */
  analyses: number;
  /** Nodes */
  nodes: number;
  masterImage?: MasterImage | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
  /**
   * Realmid
   * @format uuid
   */
  realmId: string;
  /** Userid */
  userId: string | null;
}

/** ProjectNode */
export interface ProjectNode {
  /**
   * Nodeid
   * @format uuid
   */
  nodeId: string;
  /**
   * Projectid
   * @format uuid
   */
  projectId: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Approvalstatus */
  approvalStatus: "rejected" | "approved" | null;
  /** Comment */
  comment: string | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
  node?: Node | null;
  project?: Project | null;
  /**
   * Projectrealmid
   * @format uuid
   */
  projectRealmId: string;
  /**
   * Noderealmid
   * @format uuid
   */
  nodeRealmId: string;
}

/** Registry */
export interface Registry {
  /** Name */
  name: string;
  /** Host */
  host: string;
  /** Accountname */
  accountName: string | null;
  /** Accountsecret */
  accountSecret?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** RegistryProject */
export interface RegistryProject {
  /** Name */
  name: string;
  /** Type */
  type:
    | "default"
    | "aggregator"
    | "incoming"
    | "outgoing"
    | "masterImages"
    | "node";
  /**
   * Registryid
   * @format uuid
   */
  registryId: string;
  /** Externalname */
  externalName: string;
  /** Accountname */
  accountName: string | null;
  /** Accountsecret */
  accountSecret?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Public */
  public: boolean;
  /** Externalid */
  externalId: string | null;
  /** Accountid */
  accountId: string | null;
  /** Webhookname */
  webhookName: string | null;
  /** Webhookexists */
  webhookExists: boolean | null;
  /** Realmid */
  realmId: string | null;
  registry?: Registry | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/**
 * Route
 * Route entities define rules to match client requests. Every request matching a given route will be proxied to its associated service.
 */
export interface Route {
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /**
   * Destinations
   * A list of IP destinations of incoming connections that match this route when using stream routing. Each entry is an object with fields "ip" (optionally in CIDR range notation) and/or "port".
   */
  destinations?: RouteDestinationsInner[] | null;
  /**
   * Headers
   * One or more lists of values indexed by header name that will cause this route to match if present in the request. The `Host` header cannot be used with this hosts should be specified using the `hosts` attribute. When `headers` contains only one value and that value starts with the special prefix `~*`, the value is interpreted as a regular expression.
   */
  headers?: Record<string, any> | null;
  /**
   * Hosts
   * A list of domain names that match this route. Note that the hosts value is case sensitive.
   */
  hosts?: string[] | null;
  /**
   * Https Redirect Status Code
   * The status code Kong responds with when all properties of a route match except the protocol i.e. if the protocol of the request is `HTTP` instead of `HTTPS`. `Location` header is injected by Kong if the field is set to 301, 302, 307 or 308. This config applies only if the route is configured to only accept the `https` protocol.
   * @default 426
   */
  https_redirect_status_code?: number | null;
  /** Id */
  id?: string | null;
  /**
   * Methods
   * A list of HTTP methods that match this route.
   */
  methods?: string[] | null;
  /**
   * Name
   * The name of the route. Route names must be unique, and they are case sensitive. For example, there can be two different routes named "test" and "Test".
   */
  name?: string | null;
  /**
   * Path Handling
   * Controls how the service path, route path and requested path are combined when sending a request to the upstream. See above for a detailed description of each behavior.
   * @default "v0"
   */
  path_handling?: string | null;
  /**
   * Paths
   * A list of paths that match this route.
   */
  paths?: string[] | null;
  /**
   * Preserve Host
   * When matching a route via one of the `hosts` domain names, use the request `Host` header in the upstream request headers. If set to `false`, the upstream `Host` header will be that of the services `host`.
   * @default false
   */
  preserve_host?: boolean | null;
  /**
   * Protocols
   * An array of the protocols this route should allow. See the [route Object](#route-object) section for a list of accepted protocols. When set to only `"https"`, HTTP requests are answered with an upgrade error. When set to only `"http"`, HTTPS requests are answered with an error.
   */
  protocols?: string[] | null;
  /**
   * Regex Priority
   * A number used to choose which route resolves a given request when several routes match it using regexes simultaneously. When two routes match the path and have the same `regex_priority`, the older one (lowest `created_at`) is used. Note that the priority for non-regex routes is different (longer non-regex routes are matched before shorter ones).
   * @default 0
   */
  regex_priority?: number | null;
  /**
   * Request Buffering
   * Whether to enable request body buffering or not. With HTTP 1.1, it may make sense to turn this off on services that receive data with chunked transfer encoding.
   * @default true
   */
  request_buffering?: boolean | null;
  /**
   * Response Buffering
   * Whether to enable response body buffering or not. With HTTP 1.1, it may make sense to turn this off on services that send data with chunked transfer encoding.
   * @default true
   */
  response_buffering?: boolean | null;
  service?: RouteService | null;
  /**
   * Snis
   * A list of SNIs that match this route when using stream routing.
   */
  snis?: string[] | null;
  /**
   * Sources
   * A list of IP sources of incoming connections that match this route when using stream routing. Each entry is an object with fields "ip" (optionally in CIDR range notation) and/or "port".
   */
  sources?: RouteDestinationsInner[] | null;
  /**
   * Strip Path
   * When matching a route via one of the `paths`, strip the matching prefix from the upstream request URL.
   * @default true
   */
  strip_path?: boolean | null;
  /**
   * Tags
   * An optional set of strings associated with the route for grouping and filtering.
   */
  tags?: string[] | null;
  /**
   * Updated At
   * Unix epoch when the resource was last updated.
   */
  updated_at?: number | null;
}

/**
 * RouteDestinationsInner
 * RouteDestinationsInner
 */
export interface RouteDestinationsInner {
  /** Default */
  default?: null;
}

/**
 * RouteService
 * The service this route is associated to. This is where the route proxies traffic to.
 */
export interface RouteService {
  /** Id */
  id?: string | null;
}

/**
 * RunLogs
 * Logs for a single analysis run.
 */
export interface RunLogs {
  /** Run Number */
  run_number: number;
  /** Nginx Logs */
  nginx_logs: PodLog[];
  /** Analysis Logs */
  analysis_logs: PodLog[];
}

/**
 * S3Config
 * Credentials for accessing a private S3 bucket.
 */
export interface S3Config {
  /**
   * S3 Access Key
   * @format password
   */
  s3_access_key: string;
  /**
   * S3 Secret Key
   * @format password
   */
  s3_secret_key: string;
  /**
   * S3 Region
   * @default "us-east-1"
   */
  s3_region?: string;
  /** Bucket Name */
  bucket_name?: string | null;
  /**
   * Timeout
   * @default 100000
   */
  timeout?: number;
  /** Strip Path Pattern */
  strip_path_pattern?: string | null;
}

/**
 * Service
 * service entities are abstractions of upstream services. The main attribute of a service is its URL which can be set as a single string or by specifying the `protocol`, `host`, `port` and `path` individually.
 */
export interface Service {
  /**
   * Ca Certificates
   * Array of `CA Certificate` object UUIDs that are used to build the trust store while verifying upstream server's TLS certificate. If set to `null` when Nginx default is respected. If default CA list in Nginx are not specified and TLS verification is enabled, then handshake with upstream server will always fail (because no CA are trusted).
   */
  ca_certificates?: string[] | null;
  client_certificate?: ServiceClientCertificate | null;
  /**
   * Connect Timeout
   * The timeout in milliseconds for establishing a connection to the upstream server.
   * @default 60000
   */
  connect_timeout?: number | null;
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /**
   * Enabled
   * Whether the service is active. If set to `false`, the proxy behavior will be as if any routes attached to it do not exist (404).
   * @default true
   */
  enabled?: boolean | null;
  /**
   * Host
   * The host of the upstream server. Note that the host value is case sensitive.
   */
  host?: string | null;
  /** Id */
  id?: string | null;
  /**
   * Name
   * The service name.
   */
  name?: string | null;
  /**
   * Path
   * The path to be used in requests to the upstream server.
   */
  path?: string | null;
  /**
   * Port
   * The upstream server port.
   * @default 80
   */
  port?: number | null;
  /**
   * Protocol
   * The protocol used to communicate with the upstream.
   * @default "http"
   */
  protocol?: string | null;
  /**
   * Read Timeout
   * The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server.
   * @default 60000
   */
  read_timeout?: number | null;
  /**
   * Retries
   * The number of retries to execute upon failure to proxy.
   * @default 5
   */
  retries?: number | null;
  /**
   * Tags
   * An optional set of strings associated with the service for grouping and filtering.
   */
  tags?: string[] | null;
  /**
   * Tls Verify
   * Whether to enable verification of upstream server TLS certificate. If set to `null`, then the Nginx default is respected.
   */
  tls_verify?: boolean | null;
  /**
   * Tls Verify Depth
   * Maximum depth of chain while verifying Upstream server's TLS certificate. If set to `null`, then the Nginx default is respected.'
   */
  tls_verify_depth?: number | null;
  /**
   * Updated At
   * Unix epoch when the resource was last updated.
   */
  updated_at?: number | null;
  /**
   * Url
   * Helper field to set `protocol`, `host`, `port` and `path` using a URL. This field is write-only and is not returned in responses.
   */
  url?: string | null;
  /**
   * Write Timeout
   * The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server.
   * @default 60000
   */
  write_timeout?: number | null;
}

/**
 * ServiceClientCertificate
 * Certificate to be used as client certificate while TLS handshaking to the upstream server.
 */
export interface ServiceClientCertificate {
  /** Id */
  id?: string | null;
}

/**
 * ServiceHealthBucket
 * Collection of every recorded probe falling inside a time slice.
 */
export interface ServiceHealthBucket {
  /**
   * Start
   * Inclusive start of the slice
   * @format date-time
   */
  start: string;
  /**
   * End
   * Exclusive end of the slice
   * @format date-time
   */
  end: string;
  /** Total */
  total: number;
  /** Successful */
  successful: number;
  /** Failed */
  failed: number;
  /** Max Latency Ms */
  max_latency_ms?: number | null;
  /** Avg Latency Ms */
  avg_latency_ms?: number | null;
  /** ERROR when any check in the slice failed, otherwise OK */
  worst_status: ServiceCheckStatus;
  /**
   * Message
   * Error text of the earliest failed check in the slice, if any
   */
  message?: string | null;
}

/**
 * ServiceHealthHistory
 * Response model for the stored health history of the downstream services.
 */
export interface ServiceHealthHistory {
  /**
   * Monitoring Enabled
   * Whether health checks are being recorded to Postgres
   */
  monitoring_enabled: boolean;
  /**
   * Monitoring Detail
   * Why monitoring is disabled, if applicable
   */
  monitoring_detail?: string | null;
  /**
   * Interval Seconds
   * How often the services are probed
   */
  interval_seconds?: number | null;
  /**
   * Retention Days
   * How long recorded checks are kept
   */
  retention_days?: number | null;
  /**
   * Start
   * @format date-time
   */
  start: string;
  /**
   * End
   * @format date-time
   */
  end: string;
  /** Services */
  services: Record<string, ServiceHealthSummary>;
}

/**
 * ServiceHealthPoint
 * A single recorded probe of a downstream service.
 */
export interface ServiceHealthPoint {
  /**
   * Checked At
   * @format date-time
   */
  checked_at: string;
  /** Outcome of a single recorded probe. Only these two values are ever stored. */
  status: ServiceCheckStatus;
  /** Status Code */
  status_code?: number | null;
  /** Latency Ms */
  latency_ms?: number | null;
  /** Message */
  message?: string | null;
  /**
   * Sweep Id
   * Identifies the probe cycle this check belongs to, shared by every service checked at the same time
   */
  sweep_id?: string | null;
}

/**
 * ServiceHealthSettings
 * Settings for the background routine that probes the downstream services and stores the results in Postgres.
 * Only runs when a Postgres connection could be established when the app started.
 */
export interface ServiceHealthSettings {
  /**
   * Interval
   * @default 60
   */
  interval?: number | null;
  /**
   * Retention Days
   * @default 30
   */
  retention_days?: number | null;
}

/**
 * ServiceHealthSummary
 * Aggregated health of a single downstream service over the requested timeframe.
 */
export interface ServiceHealthSummary {
  /**
   * Configured
   * Whether a URL is configured for this service on this node
   */
  configured: boolean;
  /** DISABLED means the service is not being monitored */
  status: ServiceMonitoringStatus;
  /**
   * Url
   * Health endpoint that is probed
   */
  url?: string | null;
  /**
   * Detail
   * Why the service is not being monitored, if applicable
   */
  detail?: string | null;
  /**
   * Total Checks
   * @default 0
   */
  total_checks?: number;
  /**
   * Successful Checks
   * @default 0
   */
  successful_checks?: number;
  /**
   * Failed Checks
   * @default 0
   */
  failed_checks?: number;
  /** Uptime Percentage */
  uptime_percentage?: number | null;
  /** Min Latency Ms */
  min_latency_ms?: number | null;
  /** Avg Latency Ms */
  avg_latency_ms?: number | null;
  /** Max Latency Ms */
  max_latency_ms?: number | null;
  last_status?: ServiceCheckStatus | null;
  /** Last Status Code */
  last_status_code?: number | null;
  /** Last Checked At */
  last_checked_at?: string | null;
  /** Last Error */
  last_error?: string | null;
  /**
   * Checks Returned
   * Number of raw datapoints included below
   * @default 0
   */
  checks_returned?: number;
  /**
   * Checks
   * Raw datapoints in the timeframe, newest first, capped by the limit parameter
   */
  checks?: ServiceHealthPoint[];
  /**
   * Buckets
   * Individual aggregates, only present when resolution is defined
   */
  buckets?: ServiceHealthBucket[];
}

/**
 * ServiceRequest
 * Improved version of the CreateServiceRequest with better defaults.
 */
export interface ServiceRequest {
  /**
   * Name
   * The service name.
   */
  name?: string | null;
  /**
   * Retries
   * The number of retries to execute upon failure to proxy. Default:`5`.
   * @default 5
   */
  retries?: number | null;
  /**
   * Protocol
   * @default "http"
   */
  protocol?: string | null;
  /**
   * Host
   * The host of the upstream server. Note that the host value is case sensitive.
   */
  host: string;
  /**
   * Port
   * @default 80
   */
  port?: number | null;
  /** Path */
  path: string;
  /**
   * Connect Timeout
   * The timeout in milliseconds for establishing a connection to the upstream server.
   * @default 6000
   */
  connect_timeout?: number | null;
  /**
   * Write Timeout
   * The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server. Default: `60000`.
   * @default 6000
   */
  write_timeout?: number | null;
  /**
   * Read Timeout
   * The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server. Default: `60000`.
   * @default 6000
   */
  read_timeout?: number | null;
  /**
   * Tags
   * An optional set of strings associated with the service for grouping and filtering.
   */
  tags?: string[] | null;
  client_certificate?: CreateServiceRequestClientCertificate | null;
  /** Tls Verify */
  tls_verify?: boolean | null;
  /**
   * Tls Verify Depth
   * Maximum depth of chain while verifying Upstream server's TLS certificate. If set to null, then the Nginx default is respected. Default: null.
   */
  tls_verify_depth?: string | null;
  /** Ca Certificates */
  ca_certificates?: string[] | null;
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * StatusOnlyResponse
 * Response with dynamic UUID keys and dynamic analysis keys
 */
export type StatusOnlyResponse = Partial<Record<any, PodStatus | null>>;

/**
 * Token
 * IDP token model.
 */
export interface Token {
  /** Access Token */
  access_token: string;
  /** Token Type */
  token_type: string;
  /** Expires In */
  expires_in: number;
  /** Refresh Token */
  refresh_token?: string | null;
  /** Refresh Expires In */
  refresh_expires_in?: number | null;
}

/**
 * UserSettings
 * Node configuration settings set by the user.
 */
export interface UserSettings {
  /**
   * Require Data Store
   * @default true
   */
  require_data_store?: boolean | null;
  /** @default {"enabled":false,"interval":60} */
  autostart?: AutostartSettings | null;
  /** @default {"interval":600} */
  kong_cleanup?: KongCleanupSettings | null;
  /** @default {"interval":60,"retention_days":30} */
  service_health?: ServiceHealthSettings | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
  /** Input */
  input?: any;
  /** Context */
  ctx?: object;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:5000";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title FLAME Hub Adapter API
 * @version 0.1.0
 * @license Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0.html)
 * @baseUrl http://localhost:5000
 * @contact Bruce Schultz <bschultz013@gmail.com> (https://docs.privateaim.net/about/team.html)
 *
 * FLAME Hub Adapter gateway API for interacting with downstream services.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  po = {
    /**
     * @description Gather the image URL for the requested analysis container and send information to the PO.
     *
     * @tags PodOrc
     * @name PodorcPodsCreatePoPost
     * @summary Podorc.Pods.Create
     * @request POST:/po
     * @secure
     */
    podorcPodsCreatePoPost: (
      data: BodyPodorcPodsCreatePoPost,
      params: RequestParams = {},
    ) =>
      this.request<StatusOnlyResponse, void | HTTPValidationError>({
        path: `/po`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all analysis run statuses.
     *
     * @tags PodOrc
     * @name PodorcStatusGetPoStatusGet
     * @summary Podorc.Status.Get
     * @request GET:/po/status
     * @secure
     */
    podorcStatusGetPoStatusGet: (params: RequestParams = {}) =>
      this.request<PodProgressResponse, void>({
        path: `/po/status`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a specific analysis pod run status.
     *
     * @tags PodOrc
     * @name PodorcStatusGetPoStatusAnalysisIdGet
     * @summary Podorc.Status.Get
     * @request GET:/po/status/{analysis_id}
     * @secure
     */
    podorcStatusGetPoStatusAnalysisIdGet: (
      analysisId: string | null,
      params: RequestParams = {},
    ) =>
      this.request<PodProgressResponse, void | HTTPValidationError>({
        path: `/po/status/${analysisId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all running pods in the k8s cluster.
     *
     * @tags PodOrc
     * @name PodorcPodsGetPoPodsGet
     * @summary Podorc.Pods.Get
     * @request GET:/po/pods
     * @secure
     */
    podorcPodsGetPoPodsGet: (params: RequestParams = {}) =>
      this.request<PodResponse, void>({
        path: `/po/pods`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get information on a specific running analysis pod in the k8s cluster.
     *
     * @tags PodOrc
     * @name PodorcPodsGetPoPodsAnalysisIdGet
     * @summary Podorc.Pods.Get
     * @request GET:/po/pods/{analysis_id}
     * @secure
     */
    podorcPodsGetPoPodsAnalysisIdGet: (
      analysisId: string | null,
      params: RequestParams = {},
    ) =>
      this.request<PodResponse, void | HTTPValidationError>({
        path: `/po/pods/${analysisId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Stop all analysis pods.
     *
     * @tags PodOrc
     * @name PodorcPodsStopPoStopPut
     * @summary Podorc.Pods.Stop
     * @request PUT:/po/stop
     * @secure
     */
    podorcPodsStopPoStopPut: (params: RequestParams = {}) =>
      this.request<StatusOnlyResponse, void>({
        path: `/po/stop`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Stop a specific analysis run.
     *
     * @tags PodOrc
     * @name PodorcPodsStopPoStopAnalysisIdPut
     * @summary Podorc.Pods.Stop
     * @request PUT:/po/stop/{analysis_id}
     * @secure
     */
    podorcPodsStopPoStopAnalysisIdPut: (
      analysisId: string | null,
      params: RequestParams = {},
    ) =>
      this.request<StatusOnlyResponse, void | HTTPValidationError>({
        path: `/po/stop/${analysisId}`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete all analysis pods.
     *
     * @tags PodOrc
     * @name PodorcPodsDeletePoDeleteDelete
     * @summary Podorc.Pods.Delete
     * @request DELETE:/po/delete
     * @secure
     */
    podorcPodsDeletePoDeleteDelete: (params: RequestParams = {}) =>
      this.request<StatusOnlyResponse, void>({
        path: `/po/delete`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a specific analysis run.
     *
     * @tags PodOrc
     * @name PodorcPodsDeletePoDeleteAnalysisIdDelete
     * @summary Podorc.Pods.Delete
     * @request DELETE:/po/delete/{analysis_id}
     * @secure
     */
    podorcPodsDeletePoDeleteAnalysisIdDelete: (
      analysisId: string | null,
      params: RequestParams = {},
    ) =>
      this.request<StatusOnlyResponse, void | HTTPValidationError>({
        path: `/po/delete/${analysisId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete specific types of resources. Should be a comma separated combination of the following entries: 'all', 'analyzes', 'services', 'mb', 'rs', 'keycloak'
     *
     * @tags PodOrc
     * @name PodorcCleanupPoCleanupCleanupTypeDelete
     * @summary Podorc.Cleanup
     * @request DELETE:/po/cleanup/{cleanup_type}
     * @secure
     */
    podorcCleanupPoCleanupCleanupTypeDelete: (
      cleanupType: CleanUpType,
      params: RequestParams = {},
    ) =>
      this.request<CleanupPodResponse, void | HTTPValidationError>({
        path: `/po/cleanup/${cleanupType}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  analysis = {
    /**
     * @description Perform the required checks to start an analysis and send information to the PO.
     *
     * @tags Meta
     * @name MetaInitializeAnalysisInitializePost
     * @summary Meta.Initialize
     * @request POST:/analysis/initialize
     * @secure
     */
    metaInitializeAnalysisInitializePost: (
      data: InitializeAnalysis,
      params: RequestParams = {},
    ) =>
      this.request<StatusOnlyResponse, void | HTTPValidationError>({
        path: `/analysis/initialize`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.UrlEncoded,
        format: "json",
        ...params,
      }),

    /**
     * @description Perform the required checks to stop an analysis and delete it and its components. This method will first delete the kong consumer and then send the delete command to the PO.
     *
     * @tags Meta
     * @name MetaTerminateAnalysisTerminateAnalysisIdDelete
     * @summary Meta.Terminate
     * @request DELETE:/analysis/terminate/{analysis_id}
     * @secure
     */
    metaTerminateAnalysisTerminateAnalysisIdDelete: (
      analysisId: string,
      params: RequestParams = {},
    ) =>
      this.request<StatusOnlyResponse, void | HTTPValidationError>({
        path: `/analysis/terminate/${analysisId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  node = {
    /**
     * @description Get the node configuration settings
     *
     * @tags Node
     * @name NodeSettingsGetNodeSettingsGet
     * @summary Node.Settings.Get
     * @request GET:/node/settings
     * @secure
     */
    nodeSettingsGetNodeSettingsGet: (params: RequestParams = {}) =>
      this.request<UserSettings, void>({
        path: `/node/settings`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update the node configuration settings with partial data. Raises ------ HTTPException 422: If unknown settings keys are provided.
     *
     * @tags Node
     * @name NodeSettingsUpdateNodeSettingsPost
     * @summary Node.Settings.Update
     * @request POST:/node/settings
     * @secure
     */
    nodeSettingsUpdateNodeSettingsPost: (
      data: UserSettings,
      params: RequestParams = {},
    ) =>
      this.request<UserSettings, void | HTTPValidationError>({
        path: `/node/settings`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  projects = {
    /**
     * @description List all projects.
     *
     * @tags Hub
     * @name HubProjectGetProjectsGet
     * @summary List all of the projects
     * @request GET:/projects
     * @secure
     */
    hubProjectGetProjectsGet: (
      query?: {
        /**
         * Page
         * Pagination as JSON, e.g. {"limit": 50, "offset": 0}
         */
        page?: string | null;
        /**
         * Sort
         * Sort field; prefix with - for descending, + for ascending
         */
        sort?: string | null;
        /**
         * Fields
         * Comma-separated list of fields to return
         */
        fields?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<Project[], void | HTTPValidationError>({
        path: `/projects`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  projectNodes = {
    /**
     * @description List project proposals.
     *
     * @tags Hub
     * @name HubProjectNodeGetProjectNodesGet
     * @summary List all of the project proposals
     * @request GET:/project-nodes
     * @secure
     */
    hubProjectNodeGetProjectNodesGet: (
      query?: {
        /**
         * Force Refresh
         * @default false
         */
        force_refresh?: boolean;
        /**
         * Page
         * Pagination as JSON, e.g. {"limit": 50, "offset": 0}
         */
        page?: string | null;
        /**
         * Sort
         * Sort field; prefix with - for descending, + for ascending
         */
        sort?: string | null;
        /**
         * Fields
         * Comma-separated list of fields to return
         */
        fields?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ProjectNode[], void | HTTPValidationError>({
        path: `/project-nodes`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  analysisNodes = {
    /**
     * @description List all analysis nodes for give node.
     *
     * @tags Hub
     * @name HubAnalysisNodeGetAnalysisNodesGet
     * @summary List all of the analysis proposals
     * @request GET:/analysis-nodes
     * @secure
     */
    hubAnalysisNodeGetAnalysisNodesGet: (
      query?: {
        /**
         * Force Refresh
         * @default false
         */
        force_refresh?: boolean;
        /**
         * Page
         * Pagination as JSON, e.g. {"limit": 50, "offset": 0}
         */
        page?: string | null;
        /**
         * Sort
         * Sort field; prefix with - for descending, + for ascending
         */
        sort?: string | null;
        /**
         * Fields
         * Comma-separated list of fields to return
         */
        fields?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AnalysisNode[], void | HTTPValidationError>({
        path: `/analysis-nodes`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List a specific analysis node.
     *
     * @tags Hub
     * @name HubAnalysisNodeGetAnalysisNodesAnalysisNodeIdGet
     * @summary List a specific analysis node
     * @request GET:/analysis-nodes/{analysis_node_id}
     * @secure
     */
    hubAnalysisNodeGetAnalysisNodesAnalysisNodeIdGet: (
      analysisNodeId: string,
      query?: {
        /**
         * Page
         * Pagination as JSON, e.g. {"limit": 50, "offset": 0}
         */
        page?: string | null;
        /**
         * Sort
         * Sort field; prefix with - for descending, + for ascending
         */
        sort?: string | null;
        /**
         * Fields
         * Comma-separated list of fields to return
         */
        fields?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AnalysisNode, void | HTTPValidationError>({
        path: `/analysis-nodes/${analysisNodeId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  nodeType = {
    /**
     * @description Return what type of node this API is deployed on.
     *
     * @tags Hub
     * @name HubNodeTypeGetNodeTypeGet
     * @summary Return what type of node this API is deployed on
     * @request GET:/node-type
     * @secure
     */
    hubNodeTypeGetNodeTypeGet: (params: RequestParams = {}) =>
      this.request<NodeTypeResponse, void>({
        path: `/node-type`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  local = {
    /**
     * @description Delete all objects in S3 and all Postgres database entries related to the specified project. Returns a 200 on success, a 400 if the project is still available on the Hub and a 403 if it is not the Hub Adapter client that sends the request. In both error cases nothing is deleted at all.
     *
     * @tags Storage
     * @name StorageLocalDeleteLocalDelete
     * @summary Storage.Local.Delete
     * @request DELETE:/local
     * @secure
     */
    storageLocalDeleteLocalDelete: (
      query: {
        /**
         * Project Id
         * UUID of the associated project.
         */
        project_id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/local`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  kong = {
    /**
     * @description List all available data stores (referred to as services by kong).
     *
     * @tags Kong
     * @name KongDatastoreGetKongDatastoreGet
     * @summary Kong.Datastore.Get
     * @request GET:/kong/datastore
     * @secure
     */
    kongDatastoreGetKongDatastoreGet: (
      query?: {
        /**
         * Ds Type
         * Filter by data store type
         */
        ds_type?: DataStoreType | null;
        /**
         * Detailed
         * Whether to include linked projects (routes)
         * @default false
         */
        detailed?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListServices, void | HTTPValidationError>({
        path: `/kong/datastore`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a specific data store by its Kong service ID or display name. For backwards compatibility, a project ID is also accepted. If no service matches directly, all data stores currently linked to that project are returned instead.
     *
     * @tags Kong
     * @name KongDatastoreGetKongDatastoreDatastoreIdOrNameGet
     * @summary Kong.Datastore.Get
     * @request GET:/kong/datastore/{datastore_id_or_name}
     * @secure
     */
    kongDatastoreGetKongDatastoreDatastoreIdOrNameGet: (
      datastoreIdOrName: string,
      query?: {
        /**
         * Detailed
         * Whether to include linked projects (routes)
         * @default false
         */
        detailed?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListServices, void | HTTPValidationError>({
        path: `/kong/datastore/${datastoreIdOrName}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a data store (service). Refused with 409 while projects link it, unless cascade=true. Cascading removes the link routes only, consumers (analyses) belong to projects and are untouched. For backwards compatibility, a project ID is also accepted in place of the data store id/name, but only if it resolves to exactly one linked data store, otherwise refused with 409 if the project is linked to more than 1
     *
     * @tags Kong
     * @name KongDatastoreDeleteKongDatastoreDatastoreIdOrNameDelete
     * @summary Kong.Datastore.Delete
     * @request DELETE:/kong/datastore/{datastore_id_or_name}
     * @secure
     */
    kongDatastoreDeleteKongDatastoreDatastoreIdOrNameDelete: (
      datastoreIdOrName: string,
      query?: {
        /**
         * Cascade
         * Also delete existing project links (routes)
         * @default false
         */
        cascade?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/datastore/${datastoreIdOrName}`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List all projects (referred to as routes by kong) available, can be filtered by project_id. Set "detailed" to True to include detailed information on the linked kong service.
     *
     * @tags Kong
     * @name KongProjectGetKongProjectGet
     * @summary Kong.Project.Get
     * @request GET:/kong/project
     * @secure
     */
    kongProjectGetKongProjectGet: (
      query?: {
        /**
         * Detailed
         * Whether to include detailed information on the connected kong service
         * @default false
         */
        detailed?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListRoutes, void | HTTPValidationError>({
        path: `/kong/project`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new datastore (service) and a new project (route), then links them together with a health consumer.
     *
     * @tags Kong
     * @name KongInitializeKongInitializePost
     * @summary Kong.Initialize
     * @request POST:/kong/initialize
     * @secure
     */
    kongInitializeKongInitializePost: (
      data: BodyKongInitializeKongInitializePost,
      params: RequestParams = {},
    ) =>
      this.request<LinkDataStoreProject, void | HTTPValidationError>({
        path: `/kong/initialize`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Test whether Kong can read the given data store through the project's link. Because we use the key-auth plugin, a consumer is required for pinging the data service.
     *
     * @tags Kong
     * @name KongProbeKongProjectProjectIdDatastoreDatastoreIdHealthGet
     * @summary Kong.Probe
     * @request GET:/kong/project/{project_id}/datastore/{datastore_id}/health
     * @secure
     */
    kongProbeKongProjectProjectIdDatastoreDatastoreIdHealthGet: (
      projectId: string,
      datastoreId: string,
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/project/${projectId}/datastore/${datastoreId}/health`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  healthz = {
    /**
     * No description
     *
     * @tags Health
     * @name HealthStatusGetHealthzGet
     * @summary Perform a Health Check
     * @request GET:/healthz
     */
    healthStatusGetHealthzGet: (params: RequestParams = {}) =>
      this.request<HealthCheck, any>({
        path: `/healthz`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  health = {
    /**
     * @description Return the health of the downstream microservices.
     *
     * @tags Health
     * @name HealthStatusServicesGetHealthServicesGet
     * @summary Perform a Health Check on the downstream microservices
     * @request GET:/health/services
     */
    healthStatusServicesGetHealthServicesGet: (params: RequestParams = {}) =>
      this.request<DownstreamHealthCheck, any>({
        path: `/health/services`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Return the recorded health of the downstream microservices within a timeframe. Checks are recorded by a background routine which requires Postgres. When no database connection could be made at startup, monitoring_enabled is false and monitoring_detail explains why. Services with no URL configured on this node are reported as "disabled".
     *
     * @tags Health
     * @name HealthStatusServicesHistoryGetHealthServicesHistoryGet
     * @summary Fetch the recorded health of the downstream microservices
     * @request GET:/health/services/history
     */
    healthStatusServicesHistoryGetHealthServicesHistoryGet: (
      query?: {
        /**
         * Start Date
         * Fetch checks from this timestamp using ISO8601 format. Defaults to 24 hours ago
         */
        start_date?: string | null;
        /**
         * End Date
         * Fetch checks up to this timestamp using ISO8601 format. Defaults to now
         */
        end_date?: string | null;
        /**
         * Service
         * Limit the response to these services. Can be repeated. Defaults to all services
         */
        service?: string[] | null;
        /**
         * Include Checks
         * Whether to include the raw datapoints alongside the summary
         * @default true
         */
        include_checks?: boolean;
        /**
         * Resolution
         * Aggregate checks into slices this many seconds wide instead of returning raw datapoints. Slices with no checks are omitted
         */
        resolution?: number | null;
        /**
         * Limit
         * Maximum number of raw datapoints to return per service, newest first
         * @exclusiveMin 0
         * @max 10000
         * @default 500
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ServiceHealthHistory, HTTPValidationError>({
        path: `/health/services/history`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  token = {
    /**
     * @description Get a JWT from the IDP by passing a valid username and password. This token can then be used to authenticate yourself with this API. If no client ID/secret is provided, it will be autofilled using the hub adapter.
     *
     * @tags Auth
     * @name GetTokenTokenPost
     * @summary Get a token from the IDP
     * @request POST:/token
     */
    getTokenTokenPost: (
      data: BodyGetTokenTokenPost,
      params: RequestParams = {},
    ) =>
      this.request<Token, void | HTTPValidationError>({
        path: `/token`,
        method: "POST",
        body: data,
        type: ContentType.UrlEncoded,
        format: "json",
        ...params,
      }),
  };
  events = {
    /**
     * @description Retrieve a selection of logged events.
     *
     * @tags Logs
     * @name LogsEventsGetEventsGet
     * @summary Logs.Events.Get
     * @request GET:/events
     * @secure
     */
    logsEventsGetEventsGet: (
      query?: {
        /**
         * Limit
         * Maximum number of events to return
         * @default 50
         */
        limit?: number | null;
        /**
         * Offset
         * Number of events to offset by
         */
        offset?: number | null;
        /**
         * Service Tag
         * Filter events by service tag
         */
        service_tag?: ServiceTag | null;
        /**
         * Username
         * Filter events by username
         */
        username?: string | null;
        /**
         * Start Date
         * Filter events by start date using ISO8601 format
         */
        start_date?: string | null;
        /**
         * End Date
         * Filter events by end date using ISO8601 format
         */
        end_date?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<EventLogResponse, void | HTTPValidationError>({
        path: `/events`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a log event that a user signed in. Username is extracted from the JWT required to call this endpoint.
     *
     * @tags Logs
     * @name AuthUserSigninEventsSigninPost
     * @summary Auth.User.Signin
     * @request POST:/events/signin
     * @secure
     */
    authUserSigninEventsSigninPost: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/events/signin`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a log event that a user signed out. Username is extracted from the JWT required to call this endpoint.
     *
     * @tags Logs
     * @name AuthUserSignoutEventsSignoutPost
     * @summary Auth.User.Signout
     * @request POST:/events/signout
     * @secure
     */
    authUserSignoutEventsSignoutPost: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/events/signout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  logs = {
    /**
     * @description Get the latest logs for both containers of an analysis (highest run number).
     *
     * @tags Logs
     * @name LogsAnalysisLiveGetLogsAnalysisIdGet
     * @summary Logs.Analysis.Live.Get
     * @request GET:/logs/{analysis_id}
     * @secure
     */
    logsAnalysisLiveGetLogsAnalysisIdGet: (
      analysisId: string,
      query?: {
        /**
         * Start Date
         * Filter logs from this timestamp using ISO8601 format
         */
        start_date?: string | null;
        /**
         * End Date
         * Filter logs up to this timestamp using ISO8601 format
         */
        end_date?: string | null;
        /**
         * Limit
         * Maximum number of log lines to return per container
         */
        limit?: number | null;
        /**
         * Offset
         * Number of log lines to skip per container
         * @default 0
         */
        offset?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AnalysisLogsResponse, void | HTTPValidationError>({
        path: `/logs/${analysisId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Execute a raw LogQL query against VictoriaLogs. Admin only.
     *
     * @tags Logs
     * @name LogsQueryRawLogsQueryPost
     * @summary Logs.Query.Raw
     * @request POST:/logs/query
     * @secure
     */
    logsQueryRawLogsQueryPost: (
      data: LogQLQueryRequest,
      params: RequestParams = {},
    ) =>
      this.request<LogQLQueryResponse, void | HTTPValidationError>({
        path: `/logs/query`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  history = {
    /**
     * @description Get logs for all runs of an analysis, sorted by run number ascending.
     *
     * @tags Logs
     * @name LogsAnalysisHistoryGetHistoryAnalysisIdGet
     * @summary Logs.Analysis.History.Get
     * @request GET:/history/{analysis_id}
     * @secure
     */
    logsAnalysisHistoryGetHistoryAnalysisIdGet: (
      analysisId: string,
      query?: {
        /**
         * Start Date
         * Filter logs from this timestamp using ISO8601 format
         */
        start_date?: string | null;
        /**
         * End Date
         * Filter logs up to this timestamp using ISO8601 format
         */
        end_date?: string | null;
        /**
         * Limit
         * Maximum number of log lines to return per container
         */
        limit?: number | null;
        /**
         * Offset
         * Number of log lines to skip per container
         * @default 0
         */
        offset?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<AnalysisLogHistoryResponse, void | HTTPValidationError>({
        path: `/history/${analysisId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  netstats = {
    /**
     * @description Retrieve network traffic statistics from netstats log events.
     *
     * @tags Logs
     * @name LogsNetstatsGetNetstatsGet
     * @summary Logs.Netstats.Get
     * @request GET:/netstats
     * @secure
     */
    logsNetstatsGetNetstatsGet: (
      query?: {
        /**
         * Analysis Id
         * Filter by analysis UUID
         */
        analysis_id?: string | null;
        /**
         * Start Date
         * Filter by start date using ISO8601 format
         */
        start_date?: string | null;
        /**
         * End Date
         * Filter by end date using ISO8601 format
         */
        end_date?: string | null;
        /**
         * Limit
         * Maximum number of analysis groups to return
         * @default 1000
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<NetStatResponse, void | HTTPValidationError>({
        path: `/netstats`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  requests = {
    /**
     * @description Get total API request count and a per-endpoint breakdown grouped by HTTP method and path.
     *
     * @tags Logs
     * @name LogsRequestsGetRequestsGet
     * @summary Logs.Requests.Get
     * @request GET:/requests
     * @secure
     */
    logsRequestsGetRequestsGet: (
      query?: {
        /**
         * Start Date
         * Filter requests from this timestamp using ISO8601 format
         */
        start_date?: string | null;
        /**
         * End Date
         * Filter requests up to this timestamp using ISO8601 format
         */
        end_date?: string | null;
        /**
         * Endpoint
         * Filter breakdown to paths starting with this prefix
         */
        endpoint?: string | null;
        /**
         * Method
         * Filter breakdown to a specific HTTP method (e.g. GET, POST, DELETE)
         */
        method?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiRequestCountResponse, void | HTTPValidationError>({
        path: `/requests`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
