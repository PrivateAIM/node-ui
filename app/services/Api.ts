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

/** AnalysisBucketType */
export enum AnalysisBucketType {
  CODE = "CODE",
  RESULT = "RESULT",
  TEMP = "TEMP",
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
  /**
   * Project Id
   * @format uuid
   */
  project_id: string;
  /** Master Image Id */
  master_image_id: string | null;
  /** Registry Id */
  registry_id: string | null;
  /** Image Command Arguments */
  image_command_arguments?: MasterImageCommandArgument[];
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Nodes */
  nodes: number;
  /** Nodes Approved */
  nodes_approved: number;
  /** Configuration Locked */
  configuration_locked: boolean;
  /** Configuration Entrypoint Valid */
  configuration_entrypoint_valid: boolean;
  /** Configuration Image Valid */
  configuration_image_valid: boolean;
  /** Configuration Node Aggregator Valid */
  configuration_node_aggregator_valid: boolean;
  /** Configuration Node Default Valid */
  configuration_node_default_valid: boolean;
  /** Configuration Nodes Valid */
  configuration_nodes_valid: boolean;
  /** Build Status */
  build_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Build Nodes Valid */
  build_nodes_valid: boolean;
  /** Build Progress */
  build_progress: number | null;
  /** Build Hash */
  build_hash: string | null;
  /** Build Os */
  build_os: string | null;
  /** Build Size */
  build_size: number | null;
  /** Distribution Status */
  distribution_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Distribution Progress */
  distribution_progress: number | null;
  /** Execution Status */
  execution_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Execution Progress */
  execution_progress: number | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  registry?: Registry | null;
  /**
   * Realm Id
   * @format uuid
   */
  realm_id: string;
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  project?: Project;
  master_image?: MasterImage | null;
}

/** AnalysisBucket */
export interface AnalysisBucket {
  type: AnalysisBucketType;
  /**
   * Bucket Id
   * @format uuid
   */
  bucket_id: string;
  /**
   * Analysis Id
   * @format uuid
   */
  analysis_id: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  analysis?: Analysis;
  /**
   * Realm Id
   * @format uuid
   */
  realm_id: string;
}

/** AnalysisImageUrl */
export interface AnalysisImageUrl {
  /** Image Url */
  image_url: string;
  /** Project Id */
  project_id?: string | null;
  /** Kong Token */
  kong_token?: string | null;
  /** Analysis Id */
  analysis_id: string;
  /** Registry Url */
  registry_url: string;
  /** Registry User */
  registry_user?: string | null;
  /** Registry Password */
  registry_password?: string | null;
}

/** AnalysisNode */
export interface AnalysisNode {
  /**
   * Analysis Id
   * @format uuid
   */
  analysis_id: string;
  /**
   * Node Id
   * @format uuid
   */
  node_id: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Approval Status */
  approval_status: "rejected" | "approved" | null;
  /** Execution Status */
  execution_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Execution Progress */
  execution_progress: number | null;
  /** Comment */
  comment: string | null;
  /** Artifact Tag */
  artifact_tag: string | null;
  /** Artifact Digest */
  artifact_digest: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  analysis?: Analysis;
  node?: Node;
  /**
   * Analysis Realm Id
   * @format uuid
   */
  analysis_realm_id: string;
  /**
   * Node Realm Id
   * @format uuid
   */
  node_realm_id: string;
}

/** Body_auth_token_get_token_post */
export interface BodyAuthTokenGetTokenPost {
  /**
   * Username
   * Keycloak username
   */
  username: string;
  /**
   * Password
   * Keycloak password
   */
  password: string;
}

/** Body_hub_analysis_image_get_analysis_image_post */
export interface BodyHubAnalysisImageGetAnalysisImagePost {
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

/** Body_hub_analysis_node_update_analysis_nodes__analysis_node_id__post */
export interface BodyHubAnalysisNodeUpdateAnalysisNodesAnalysisNodeIdPost {
  /**
   * Approval Status
   * Set the approval status of project for the node. Either 'rejected' or 'approved'
   */
  approval_status: "rejected" | "approved";
}

/** Body_hub_project_node_update_project_nodes__project_node_id__post */
export interface BodyHubProjectNodeUpdateProjectNodesProjectNodeIdPost {
  /**
   * Approval Status
   * Set the approval status of project for the node. Either 'rejected' or 'approved'
   */
  approval_status: "rejected" | "approved";
}

/** Body_kong_analysis_create_kong_analysis_post */
export interface BodyKongAnalysisCreateKongAnalysisPost {
  /**
   * Project Id
   * UUID or name of the project
   */
  project_id: string;
  /**
   * Analysis Id
   * UUID or name of the analysis
   */
  analysis_id: string;
}

/** Body_kong_datastore_create_kong_datastore_post */
export interface BodyKongDatastoreCreateKongDatastorePost {
  /**
   * Data store metadata.
   * Required information for creating a new data store.
   */
  datastore: ServiceRequest;
  /** Data store type. Either 's3' or 'fhir' */
  ds_type: DataStoreType;
  /** Minio configuration */
  minio_config?: MinioConfig | null;
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
  /** Data store type. Either 's3' or 'fhir' */
  ds_type: DataStoreType;
  /**
   * Data store metadata.
   * Required information for creating a new data store.
   */
  datastore: ServiceRequest;
  /** Minio configuration */
  minio_config?: MinioConfig | null;
}

/** Body_kong_project_create_kong_project_post */
export interface BodyKongProjectCreateKongProjectPost {
  /**
   * Data Store Id
   * UUID of the data store or 'service'
   */
  data_store_id: string;
  /**
   * Project Id
   * UUID of the project
   */
  project_id: string;
  /**
   * Methods
   * List of acceptable HTTP methods
   * @default ["GET"]
   */
  methods?: HttpMethodCode[];
  /**
   * Protocols
   * List of acceptable transfer protocols. A combo of 'http', 'grpc', 'grpcs', 'tls', 'tcp'
   * @default ["http"]
   */
  protocols?: ProtocolCode[];
  /**
   * Data store type. Either 's3' or 'fhir'
   * @default "fhir"
   */
  ds_type?: DataStoreType;
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
 * Consumer
 * The Consumer object represents a consumer - or a user - of a service. You can either rely on Kong as the primary datastore, or you can map the consumer list with your database to keep consistency between Kong and your existing primary datastore.
 */
export interface Consumer {
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /**
   * Custom Id
   * Field for storing an existing unique ID for the Consumer - useful for mapping Kong with users in your existing database. You must send either this field or `username` with the request.
   */
  custom_id?: string | null;
  /** Id */
  id?: string | null;
  /**
   * Tags
   * An optional set of strings associated with the Consumer for grouping and filtering.
   */
  tags?: string[] | null;
  /**
   * Username
   * The unique username of the Consumer. You must send either this field or `custom_id` with the request.
   */
  username?: string | null;
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
 * DeleteProject
 * Response from disconnecting a project from a datastore.
 */
export interface DeleteProject {
  removed: Route | null;
  /** Status */
  status?: number | null;
}

/**
 * DetailedAnalysis
 * Model representing a single detailed analysis.
 */
export interface DetailedAnalysis {
  /** Description */
  description: string | null;
  /** Name */
  name: string | null;
  /**
   * Project Id
   * @format uuid
   */
  project_id: string;
  /** Master Image Id */
  master_image_id: string | null;
  /** Registry Id */
  registry_id: string | null;
  /** Image Command Arguments */
  image_command_arguments?: MasterImageCommandArgument[];
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Nodes */
  nodes: number;
  /** Nodes Approved */
  nodes_approved: number;
  /** Configuration Locked */
  configuration_locked: boolean;
  /** Configuration Entrypoint Valid */
  configuration_entrypoint_valid: boolean;
  /** Configuration Image Valid */
  configuration_image_valid: boolean;
  /** Configuration Node Aggregator Valid */
  configuration_node_aggregator_valid: boolean;
  /** Configuration Node Default Valid */
  configuration_node_default_valid: boolean;
  /** Configuration Nodes Valid */
  configuration_nodes_valid: boolean;
  /** Build Status */
  build_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Build Nodes Valid */
  build_nodes_valid: boolean;
  /** Build Progress */
  build_progress: number | null;
  /** Build Hash */
  build_hash: string | null;
  /** Build Os */
  build_os: string | null;
  /** Build Size */
  build_size: number | null;
  /** Distribution Status */
  distribution_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Distribution Progress */
  distribution_progress: number | null;
  /** Execution Status */
  execution_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Execution Progress */
  execution_progress: number | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  registry?: Registry | null;
  /**
   * Realm Id
   * @format uuid
   */
  realm_id: string;
  /**
   * User Id
   * @format uuid
   */
  user_id: string;
  project?: Project | null;
  master_image?: MasterImage | null;
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
  /** Po */
  po: HealthCheck | string;
  /** Storage */
  storage: HealthCheck | string;
  /** Kong */
  kong: HealthCheck | string;
}

/**
 * EventLog
 * Event log response model.
 */
export interface EventLog {
  /** Id */
  id: number;
  /** Event Name */
  event_name: string;
  /** Service Name */
  service_name: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Body */
  body: string;
  /** Attributes */
  attributes: Record<string, any>;
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
  /**
   * Status
   * @default "OK"
   */
  status?: string;
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

/** LinkDataStoreProject */
export interface LinkDataStoreProject {
  /** Route entities define rules to match client requests. Every request matching a given route will be proxied to its associated service. */
  route: Route;
  /** A Key-auth entity represents a key used to authenticate consumers with the key-auth plugin. The key-auth plugin is used to protect API endpoints by requiring a secret key to be sent with the request. */
  keyauth: KeyAuth;
  /** ACL entities are used to control access to a resource. An ACL can be applied to a Consumer */
  acl: ACL;
}

/** LinkProjectAnalysis */
export interface LinkProjectAnalysis {
  /** The Consumer object represents a consumer - or a user - of a service. You can either rely on Kong as the primary datastore, or you can map the consumer list with your database to keep consistency between Kong and your existing primary datastore. */
  consumer: Consumer;
  /** A Key-auth entity represents a key used to authenticate consumers with the key-auth plugin. The key-auth plugin is used to protect API endpoints by requiring a secret key to be sent with the request. */
  keyauth: KeyAuth;
  /** ACL entities are used to control access to a resource. An ACL can be applied to a Consumer */
  acl: ACL;
}

/**
 * ListConsumers
 * Custom route list response model.
 */
export interface ListConsumers {
  /** Data */
  data?: Consumer[] | null;
  /**
   * Offset
   * Offset is used to paginate through the API. Provide this value to the next list operation to fetch the next page
   */
  offset?: string | null;
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
 * LogReport
 * Response with dynamic UUID keys and dynamic analysis log keys
 */
export type LogReport = Record<any, (string | null)[]>;

/**
 * LogResponse
 * Response for log endpoint
 */
export interface LogResponse {
  analysis?: LogReport | null;
  nginx?: LogReport | null;
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
  /** Virtual Path */
  virtual_path: string;
  /** Group Virtual Path */
  group_virtual_path: string;
  /** Build Status */
  build_status:
    | "starting"
    | "started"
    | "stopping"
    | "stopped"
    | "executing"
    | "executed"
    | "failed"
    | null;
  /** Build Progress */
  build_progress: number | null;
  /** Name */
  name: string;
  /** Command */
  command: string | null;
  /** Command Arguments */
  command_arguments: MasterImageCommandArgument[] | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
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
  offset: number;
}

/**
 * MinioConfig
 * Credentials for accessing a private S3 bucket hosted on MinIO.
 */
export interface MinioConfig {
  /**
   * Minio Access Key
   * @format password
   */
  minio_access_key: string;
  /**
   * Minio Secret Key
   * @format password
   */
  minio_secret_key: string;
  /**
   * Minio Region
   * @default "us-east-1"
   */
  minio_region?: string;
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

/** Node */
export interface Node {
  /** External Name */
  external_name: string | null;
  /** Hidden */
  hidden: boolean | null;
  /** Name */
  name: string;
  /** Realm Id */
  realm_id: string | null;
  /** Registry Id */
  registry_id: string | null;
  /** Type */
  type: "aggregator" | "default" | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Public Key */
  public_key: string | null;
  /** Online */
  online: boolean;
  registry?: Registry | null;
  /** Registry Project Id */
  registry_project_id: string | null;
  registry_project?: RegistryProject | null;
  /** Robot Id */
  robot_id: string | null;
  /** Client Id */
  client_id: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** NodeSettings */
export interface NodeSettings {
  /**
   * Data Required
   * @default true
   */
  data_required?: boolean | null;
}

/** NodeTypeResponse */
export interface NodeTypeResponse {
  /** Type */
  type: "aggregator" | "default";
}

/** PodResponse */
export type PodResponse = Record<any, (string | null)[]>;

/** Project */
export interface Project {
  /** Description */
  description: string | null;
  /** Master Image Id */
  master_image_id: string | null;
  /** Name */
  name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Analyses */
  analyses: number;
  /** Nodes */
  nodes: number;
  master_image?: MasterImage | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Realm Id
   * @format uuid
   */
  realm_id: string;
  /** User Id */
  user_id: string | null;
  /** Robot Id */
  robot_id: string | null;
}

/** ProjectNode */
export interface ProjectNode {
  /**
   * Node Id
   * @format uuid
   */
  node_id: string;
  /**
   * Project Id
   * @format uuid
   */
  project_id: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Approval Status */
  approval_status: "rejected" | "approved";
  /** Comment */
  comment: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  node?: Node;
  project?: Project;
  /**
   * Project Realm Id
   * @format uuid
   */
  project_realm_id: string;
  /**
   * Node Realm Id
   * @format uuid
   */
  node_realm_id: string;
}

/** Registry */
export interface Registry {
  /** Name */
  name: string;
  /** Host */
  host: string;
  /** Account Name */
  account_name: string | null;
  /** Account Secret */
  account_secret?: string | null;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
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
   * Registry Id
   * @format uuid
   */
  registry_id: string;
  /** External Name */
  external_name: string;
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Public */
  public: boolean;
  /** External Id */
  external_id: string | null;
  /** Webhook Name */
  webhook_name: string | null;
  /** Webhook Exists */
  webhook_exists: boolean | null;
  /** Realm Id */
  realm_id: string | null;
  registry?: Registry;
  /** Account Id */
  account_id?: string | null;
  /** Account Name */
  account_name?: string | null;
  /** Account Secret */
  account_secret?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
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
 * StatusResponse
 * Response with dynamic UUID keys and dynamic analysis keys
 */
export type StatusResponse = Record<any, PodStatus>;

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

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
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
  public baseUrl: string = "";
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
 * @title FLAME API
 * @version 0.1.0
 * @license Apache 2.0 (https://www.apache.org/licenses/LICENSE-2.0.html)
 *
 * FLAME project API for interacting with various microservices within the node for the UI.
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
      this.request<StatusResponse, void | HTTPValidationError>({
        path: `/po`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all analysis pod logs.
     *
     * @tags PodOrc
     * @name PodorcLogsGetPoLogsGet
     * @summary Podorc.Logs.Get
     * @request GET:/po/logs
     * @secure
     */
    podorcLogsGetPoLogsGet: (params: RequestParams = {}) =>
      this.request<LogResponse, void>({
        path: `/po/logs`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the analysis pod logs.
     *
     * @tags PodOrc
     * @name PodorcLogsGetPoLogsAnalysisIdGet
     * @summary Podorc.Logs.Get
     * @request GET:/po/logs/{analysis_id}
     * @secure
     */
    podorcLogsGetPoLogsAnalysisIdGet: (
      analysisId: string,
      params: RequestParams = {},
    ) =>
      this.request<LogResponse, void | HTTPValidationError>({
        path: `/po/logs/${analysisId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get all previous analysis pod logs.
     *
     * @tags PodOrc
     * @name PodorcHistoryGetPoHistoryGet
     * @summary Podorc.History.Get
     * @request GET:/po/history
     * @secure
     */
    podorcHistoryGetPoHistoryGet: (params: RequestParams = {}) =>
      this.request<LogResponse, void>({
        path: `/po/history`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the previous analysis pod logs.
     *
     * @tags PodOrc
     * @name PodorcHistoryGetPoHistoryAnalysisIdGet
     * @summary Podorc.History.Get
     * @request GET:/po/history/{analysis_id}
     * @secure
     */
    podorcHistoryGetPoHistoryAnalysisIdGet: (
      analysisId: string | null,
      params: RequestParams = {},
    ) =>
      this.request<LogResponse, void | HTTPValidationError>({
        path: `/po/history/${analysisId}`,
        method: "GET",
        secure: true,
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
      this.request<StatusResponse, void>({
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
      this.request<StatusResponse, void | HTTPValidationError>({
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
      this.request<StatusResponse, void>({
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
      this.request<StatusResponse, void | HTTPValidationError>({
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
      this.request<StatusResponse, void>({
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
      this.request<StatusResponse, void | HTTPValidationError>({
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
      this.request<StatusResponse, void | HTTPValidationError>({
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
      this.request<StatusResponse, void | HTTPValidationError>({
        path: `/analysis/terminate/${analysisId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Build an analysis image URL using its metadata from the Hub.
     *
     * @tags Hub
     * @name HubAnalysisImageGetAnalysisImagePost
     * @summary Hub.Analysis.Image.Get
     * @request POST:/analysis/image
     * @secure
     */
    hubAnalysisImageGetAnalysisImagePost: (
      data: BodyHubAnalysisImageGetAnalysisImagePost,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisImageUrl, void | HTTPValidationError>({
        path: `/analysis/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
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
      this.request<NodeSettings, void>({
        path: `/node/settings`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update the node configuration settings.
     *
     * @tags Node
     * @name NodeSettingsUpdateNodeSettingsPost
     * @summary Node.Settings.Update
     * @request POST:/node/settings
     * @secure
     */
    nodeSettingsUpdateNodeSettingsPost: (
      data: NodeSettings,
      params: RequestParams = {},
    ) =>
      this.request<NodeSettings, void | HTTPValidationError>({
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
    hubProjectGetProjectsGet: (params: RequestParams = {}) =>
      this.request<Project[], void>({
        path: `/projects`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List project for a given UUID.
     *
     * @tags Hub
     * @name HubProjectGetProjectsProjectIdGet
     * @summary List a specific project
     * @request GET:/projects/{project_id}
     * @secure
     */
    hubProjectGetProjectsProjectIdGet: (
      projectId: string,
      params: RequestParams = {},
    ) =>
      this.request<Project, void | HTTPValidationError>({
        path: `/projects/${projectId}`,
        method: "GET",
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

    /**
     * @description Set the approval status of a project proposal.
     *
     * @tags Hub
     * @name HubProjectNodeGetProjectNodesProjectNodeIdGet
     * @summary List a specific project proposal
     * @request GET:/project-nodes/{project_node_id}
     * @secure
     */
    hubProjectNodeGetProjectNodesProjectNodeIdGet: (
      projectNodeId: string,
      params: RequestParams = {},
    ) =>
      this.request<ProjectNode, void | HTTPValidationError>({
        path: `/project-nodes/${projectNodeId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Set the approval status of a project proposal.
     *
     * @tags Hub
     * @name HubProjectNodeUpdateProjectNodesProjectNodeIdPost
     * @summary Update a specific project proposal
     * @request POST:/project-nodes/{project_node_id}
     * @secure
     */
    hubProjectNodeUpdateProjectNodesProjectNodeIdPost: (
      projectNodeId: string,
      data: BodyHubProjectNodeUpdateProjectNodesProjectNodeIdPost,
      params: RequestParams = {},
    ) =>
      this.request<ProjectNode, void | HTTPValidationError>({
        path: `/project-nodes/${projectNodeId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.UrlEncoded,
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
      params: RequestParams = {},
    ) =>
      this.request<AnalysisNode, void | HTTPValidationError>({
        path: `/analysis-nodes/${analysisNodeId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Set the approval status of an analysis proposal.
     *
     * @tags Hub
     * @name HubAnalysisNodeUpdateAnalysisNodesAnalysisNodeIdPost
     * @summary Update a specific analysis proposal
     * @request POST:/analysis-nodes/{analysis_node_id}
     * @secure
     */
    hubAnalysisNodeUpdateAnalysisNodesAnalysisNodeIdPost: (
      analysisNodeId: string,
      data: BodyHubAnalysisNodeUpdateAnalysisNodesAnalysisNodeIdPost,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisNode, void | HTTPValidationError>({
        path: `/analysis-nodes/${analysisNodeId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.UrlEncoded,
        format: "json",
        ...params,
      }),
  };
  analyses = {
    /**
     * @description List all registered analyses.
     *
     * @tags Hub
     * @name HubAnalysisGetAnalysesGet
     * @summary List all of the analysis proposals
     * @request GET:/analyses
     * @secure
     */
    hubAnalysisGetAnalysesGet: (params: RequestParams = {}) =>
      this.request<Analysis[], void>({
        path: `/analyses`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List a specific analysis.
     *
     * @tags Hub
     * @name HubAnalysisGetAnalysesAnalysisIdGet
     * @summary List a specific analysis
     * @request GET:/analyses/{analysis_id}
     * @secure
     */
    hubAnalysisGetAnalysesAnalysisIdGet: (
      analysisId: string,
      params: RequestParams = {},
    ) =>
      this.request<Analysis, void | HTTPValidationError>({
        path: `/analyses/${analysisId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Update analysis with a given UUID.
     *
     * @tags Hub
     * @name HubAnalysisUpdateAnalysesAnalysisIdPost
     * @summary Update a specific analysis proposal
     * @request POST:/analyses/{analysis_id}
     * @secure
     */
    hubAnalysisUpdateAnalysesAnalysisIdPost: (
      analysisId: string,
      data: string,
      params: RequestParams = {},
    ) =>
      this.request<DetailedAnalysis, void | HTTPValidationError>({
        path: `/analyses/${analysisId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  nodes = {
    /**
     * @description List all nodes.
     *
     * @tags Hub
     * @name HubNodeGetNodesGet
     * @summary List all of the nodes
     * @request GET:/nodes
     * @secure
     */
    hubNodeGetNodesGet: (params: RequestParams = {}) =>
      this.request<Node[], void>({
        path: `/nodes`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List a specific node.
     *
     * @tags Hub
     * @name HubNodeGetNodesNodeIdGet
     * @summary List a specific node
     * @request GET:/nodes/{node_id}
     * @secure
     */
    hubNodeGetNodesNodeIdGet: (nodeId: string, params: RequestParams = {}) =>
      this.request<Node, void | HTTPValidationError>({
        path: `/nodes/${nodeId}`,
        method: "GET",
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
  registryProjects = {
    /**
     * @description List registry data for a project.
     *
     * @tags Hub
     * @name HubRegistryMetadataGetRegistryProjectsRegistryProjectIdGet
     * @summary Get registry project
     * @request GET:/registry-projects/{registry_project_id}
     * @secure
     */
    hubRegistryMetadataGetRegistryProjectsRegistryProjectIdGet: (
      registryProjectId: string,
      params: RequestParams = {},
    ) =>
      this.request<RegistryProject, void | HTTPValidationError>({
        path: `/registry-projects/${registryProjectId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  analysisBuckets = {
    /**
     * @description List all analysis buckets.
     *
     * @tags Hub
     * @name HubAnalysisBucketGetAnalysisBucketsGet
     * @summary List a specific analysis bucket
     * @request GET:/analysis-buckets
     * @secure
     */
    hubAnalysisBucketGetAnalysisBucketsGet: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/analysis-buckets`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List a specific analysis bucket.
     *
     * @tags Hub
     * @name HubAnalysisBucketGetAnalysisBucketsAnalysisBucketIdGet
     * @summary List a specific analysis bucket
     * @request GET:/analysis-buckets/{analysis_bucket_id}
     * @secure
     */
    hubAnalysisBucketGetAnalysisBucketsAnalysisBucketIdGet: (
      analysisBucketId: string,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisBucket, void | HTTPValidationError>({
        path: `/analysis-buckets/${analysisBucketId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  analysisBucketFiles = {
    /**
     * @description List partial analysis bucket files.
     *
     * @tags Hub
     * @name HubAnalysisBucketFileGetAnalysisBucketFilesGet
     * @summary List partial analysis bucket files.
     * @request GET:/analysis-bucket-files
     * @secure
     */
    hubAnalysisBucketFileGetAnalysisBucketFilesGet: (
      params: RequestParams = {},
    ) =>
      this.request<any, void>({
        path: `/analysis-bucket-files`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List specific partial analysis bucket file.
     *
     * @tags Hub
     * @name HubAnalysisBucketFileGetAnalysisBucketFilesAnalysisBucketFileIdGet
     * @summary List partial analysis bucket files.
     * @request GET:/analysis-bucket-files/{analysis_bucket_file_id}
     * @secure
     */
    hubAnalysisBucketFileGetAnalysisBucketFilesAnalysisBucketFileIdGet: (
      analysisBucketFileId: string,
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/analysis-bucket-files/${analysisBucketFileId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  local = {
    /**
     * @description Delete all objects in MinIO and all Postgres database entries related to the specified project. Returns a 200 on success, a 400 if the project is still available on the Hub and a 403 if it is not the Hub Adapter client that sends the request. In both error cases nothing is deleted at all.
     *
     * @tags Storage
     * @name StorageLocalDeleteLocalDelete
     * @summary Storage.Local.Delete
     * @request DELETE:/local/
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
        path: `/local/`,
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
         * Detailed
         * Whether to include detailed information on projects
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
     * @description Create a datastore (referred to as services by kong) by providing necessary metadata.
     *
     * @tags Kong
     * @name KongDatastoreCreateKongDatastorePost
     * @summary Kong.Datastore.Create
     * @request POST:/kong/datastore
     * @secure
     */
    kongDatastoreCreateKongDatastorePost: (
      data: BodyKongDatastoreCreateKongDatastorePost,
      params: RequestParams = {},
    ) =>
      this.request<Service, void | HTTPValidationError>({
        path: `/kong/datastore`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a specific data store using the project UUID
     *
     * @tags Kong
     * @name KongDatastoreGetKongDatastoreProjectIdGet
     * @summary Kong.Datastore.Get
     * @request GET:/kong/datastore/{project_id}
     * @secure
     */
    kongDatastoreGetKongDatastoreProjectIdGet: (
      projectId: string,
      query?: {
        /**
         * Detailed
         * Whether to include detailed information on projects
         * @default false
         */
        detailed?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListServices, void | HTTPValidationError>({
        path: `/kong/datastore/${projectId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete the listed data store (referred to as services by kong).
     *
     * @tags Kong
     * @name KongDatastoreDeleteKongDatastoreDataStoreNameDelete
     * @summary Kong.Datastore.Delete
     * @request DELETE:/kong/datastore/{data_store_name}
     * @secure
     */
    kongDatastoreDeleteKongDatastoreDataStoreNameDelete: (
      dataStoreName: string,
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/datastore/${dataStoreName}`,
        method: "DELETE",
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
     * @description Connect a project to a data store (referred to as a route by kong).
     *
     * @tags Kong
     * @name KongProjectCreateKongProjectPost
     * @summary Kong.Project.Create
     * @request POST:/kong/project
     * @secure
     */
    kongProjectCreateKongProjectPost: (
      data: BodyKongProjectCreateKongProjectPost,
      params: RequestParams = {},
    ) =>
      this.request<LinkDataStoreProject, void | HTTPValidationError>({
        path: `/kong/project`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List a specific projects (referred to as routes by kong) using the project UUID. Set "detailed" to True to include detailed information on the linked kong service.
     *
     * @tags Kong
     * @name KongProjectGetKongProjectProjectIdGet
     * @summary Kong.Project.Get
     * @request GET:/kong/project/{project_id}
     * @secure
     */
    kongProjectGetKongProjectProjectIdGet: (
      projectId: string,
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
        path: `/kong/project/${projectId}`,
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
     * @description Disconnect a project (route) from all data stores (services) and delete associated analyses (consumers).
     *
     * @tags Kong
     * @name KongProjectDeleteKongProjectProjectRouteIdDelete
     * @summary Kong.Project.Delete
     * @request DELETE:/kong/project/{project_route_id}
     * @secure
     */
    kongProjectDeleteKongProjectProjectRouteIdDelete: (
      projectRouteId: string,
      params: RequestParams = {},
    ) =>
      this.request<DeleteProject, void | HTTPValidationError>({
        path: `/kong/project/${projectRouteId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List all analyses (referred to as consumers by kong) available. Can be filtered by project UUID using tag.
     *
     * @tags Kong
     * @name KongAnalysisGetKongAnalysisGet
     * @summary Kong.Analysis.Get
     * @request GET:/kong/analysis
     * @secure
     */
    kongAnalysisGetKongAnalysisGet: (
      query?: {
        /**
         * Tag
         * Filter consumers by project using the project UUID
         */
        tag?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListConsumers, void | HTTPValidationError>({
        path: `/kong/analysis`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new analysis and link it to a project.
     *
     * @tags Kong
     * @name KongAnalysisCreateKongAnalysisPost
     * @summary Kong.Analysis.Create
     * @request POST:/kong/analysis
     * @secure
     */
    kongAnalysisCreateKongAnalysisPost: (
      data: BodyKongAnalysisCreateKongAnalysisPost,
      params: RequestParams = {},
    ) =>
      this.request<LinkProjectAnalysis, void | HTTPValidationError>({
        path: `/kong/analysis`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List all analyses (referred to as consumers by kong) available.
     *
     * @tags Kong
     * @name KongAnalysisGetKongAnalysisAnalysisIdGet
     * @summary Kong.Analysis.Get
     * @request GET:/kong/analysis/{analysis_id}
     * @secure
     */
    kongAnalysisGetKongAnalysisAnalysisIdGet: (
      analysisId: string | null,
      query?: {
        /**
         * Tag
         * Filter consumers by project using the project UUID
         */
        tag?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListConsumers, void | HTTPValidationError>({
        path: `/kong/analysis/${analysisId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete the listed analysis.
     *
     * @tags Kong
     * @name KongAnalysisDeleteKongAnalysisAnalysisIdDelete
     * @summary Kong.Analysis.Delete
     * @request DELETE:/kong/analysis/{analysis_id}
     * @secure
     */
    kongAnalysisDeleteKongAnalysisAnalysisIdDelete: (
      analysisId: string,
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/analysis/${analysisId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Test whether Kong can read the requested data source. Because we use the key-auth plugin, a consumer is required for pinging the data service.
     *
     * @tags Kong
     * @name KongProbeKongProjectProjectIdDsTypeHealthGet
     * @summary Kong.Probe
     * @request GET:/kong/project/{project_id}/{ds_type}/health
     * @secure
     */
    kongProbeKongProjectProjectIdDsTypeHealthGet: (
      projectId: string,
      dsType: DataStoreType,
      params: RequestParams = {},
    ) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/project/${projectId}/${dsType}/health`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  healthz = {
    /**
     * @description ## Perform a Health Check Endpoint to perform a healthcheck on. This endpoint can primarily be used Docker to ensure a robust container orchestration and management is in place. Other services which rely on proper functioning of the API service will not deploy if this endpoint returns any other HTTP status code except 200 (OK). Returns: HealthCheck: Returns a JSON response with the health status
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
  };
  token = {
    /**
     * @description Get a JWT from the IDP by passing a valid username and password. This token can then be used to authenticate yourself with this API. If no client ID/secret is provided, it will be autofilled using the hub adapter.
     *
     * @tags Auth
     * @name AuthTokenGetTokenPost
     * @summary Get a token from the IDP
     * @request POST:/token
     */
    authTokenGetTokenPost: (
      data: BodyAuthTokenGetTokenPost,
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
     * @tags Events
     * @name EventsGetEventsGet
     * @summary Events.Get
     * @request GET:/events
     * @secure
     */
    eventsGetEventsGet: (
      query?: {
        /**
         * Limit
         * Maximum number of events to return
         */
        limit?: number | null;
        /**
         * Offset
         * Number of events to offset by
         * @default 0
         */
        offset?: number | null;
        /**
         * Service Tag
         * Filter events by service tag
         */
        service_tag?: string | null;
        /**
         * Event Name
         * Filter events by event name
         */
        event_name?: string | null;
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
     * @tags Events
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
     * @tags Events
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
}
