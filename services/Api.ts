/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

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

/**
 * AllAnalyses
 * List of all projects.
 */
export interface AllAnalyses {
  /** Data */
  data: Analysis[];
}

/**
 * AllProjects
 * List of all projects.
 */
export interface AllProjects {
  /** Data */
  data: Project[];
}

/**
 * Analysis
 * Model representing a single analysis.
 */
export interface Analysis {
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
  /** Name */
  name?: string | null;
  /** Nodes */
  nodes: number;
  configuration_status?: ConfigurationStatus | null;
  build_status?: AnalysisBuildStatus | null;
  run_status?: AnalysisRunStatus | null;
  registry?: Registry | null;
  /** Registry Id */
  registry_id?: string | null;
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
  /**
   * Project Id
   * @format uuid
   */
  project_id: string;
  project?: Project | null;
  /** Master Image Id */
  master_image_id?: string | null;
  master_image?: MasterImage | null;
}

/**
 * AnalysisBuildStatus
 * Possible values for analysis build status.
 */
export enum AnalysisBuildStatus {
  Starting = "starting",
  Started = "started",
  Stopping = "stopping",
  Stopped = "stopped",
  Finished = "finished",
  Failed = "failed",
}

/** AnalysisImageUrl */
export interface AnalysisImageUrl {
  /** Image Url */
  image_url: string;
}

/**
 * AnalysisNode
 * Node analysis response model.
 */
export interface AnalysisNode {
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
  /** Status of project possibilities. */
  approval_status: ApprovalStatus;
  run_status?: AnalysisRunStatus | null;
  /** Comment */
  comment?: string | null;
  /** Index */
  index: number;
  /** Artifact Tag */
  artifact_tag?: string | null;
  /** Artifact Digest */
  artifact_digest?: string | null;
  /**
   * Analysis Id
   * @format uuid
   */
  analysis_id: string;
  /**
   * Analysis Realm Id
   * @format uuid
   */
  analysis_realm_id: string;
  /**
   * Node Id
   * @format uuid
   */
  node_id: string;
  /**
   * Node Realm Id
   * @format uuid
   */
  node_realm_id: string;
  analysis?: Analysis | null;
  node?: Node | null;
}

/**
 * AnalysisRunStatus
 * Possible values for analysis run status.
 */
export enum AnalysisRunStatus {
  Running = "running",
  Starting = "starting",
  Started = "started",
  Stopping = "stopping",
  Stopped = "stopped",
  Finished = "finished",
  Failed = "failed",
}

/**
 * ApprovalStatus
 * Status of project possibilities.
 */
export enum ApprovalStatus {
  Approved = "approved",
  Rejected = "rejected",
}

/** Body_accept_reject_analysis_node_analysis_nodes__analysis_id__post */
export interface BodyAcceptRejectAnalysisNodeAnalysisNodesAnalysisIdPost {
  /** Set the approval status of project for the node. Either 'rejected' or 'approved' */
  approval_status: ApprovalStatus;
}

/** Body_accept_reject_project_proposal_project_nodes__proposal_id__post */
export interface BodyAcceptRejectProjectProposalProjectNodesProposalIdPost {
  /** Set the approval status of project for the node. Either 'rejected' or 'approved' */
  approval_status: ApprovalStatus;
}

/** Body_create_analysis_po_post */
export interface BodyCreateAnalysisPoPost {
  /**
   * Analysis Id
   * UUID of the analysis.
   * @format uuid
   */
  analysis_id: string;
  /**
   * Project Id
   * UUID of the analysis.
   * @format uuid
   */
  project_id: string;
}

/** Body_create_and_connect_analysis_to_project_kong_analysis_post */
export interface BodyCreateAndConnectAnalysisToProjectKongAnalysisPost {
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

/** Body_create_route_between_datastore_and_project_kong_route_post */
export interface BodyCreateRouteBetweenDatastoreAndProjectKongRoutePost {
  /**
   * Data Store Id
   * UUID of the data store or 'gateway'
   * @format uuid
   */
  data_store_id: string;
  /**
   * Project Id
   * UUID of the project
   * @format uuid
   */
  project_id: string;
  /**
   * Methods
   * List of acceptable HTTP methods
   * @default ["GET","POST","PUT","DELETE"]
   */
  methods?: string[];
  /**
   * Protocols
   * List of acceptable transfer protocols. A combo of 'http', 'grpc', 'grpcs', 'tls', 'tcp'
   * @default ["http"]
   */
  protocols?: string[];
  /**
   * Ds Type
   * Data store type. Either 's3' or 'fhir'
   * @default "fhir"
   */
  ds_type?: string;
}

/** Body_get_token_token_post */
export interface BodyGetTokenTokenPost {
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

/** Body_inspect_token_token_inspect_post */
export interface BodyInspectTokenTokenInspectPost {
  /**
   * Token
   * JSON web token
   */
  token: string;
}

/** Body_submit_final_result_to_hub_final_put */
export interface BodySubmitFinalResultToHubFinalPut {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_submit_intermediate_result_to_hub_intermediate_put */
export interface BodySubmitIntermediateResultToHubIntermediatePut {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** Body_submit_intermediate_result_to_local_local_put */
export interface BodySubmitIntermediateResultToLocalLocalPut {
  /**
   * File
   * @format binary
   */
  file: File;
}

/**
 * ConfigurationStatus
 * "Possible values for configuration status.
 */
export enum ConfigurationStatus {
  Base = "base",
  SecurityConfigured = "security_configured",
  ResourceConfigured = "resource_configured",
  HashGenerated = "hash_generated",
  HashSigned = "hash_signed",
  Finished = "finished",
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
 * Disconnect
 * Response from disconnecting a project from a datastore.
 */
export interface Disconnect {
  /** Removed Routes */
  removed_routes: string[] | null;
  /** Status */
  status?: number | null;
}

/**
 * DownstreamHealthCheck
 * Response model for downstream health checks.
 */
export interface DownstreamHealthCheck {
  /** Po */
  po: object | string;
  /** Results */
  results: object | string;
  /** Kong */
  kong: object | string;
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

/**
 * ImageDataResponse
 * Response model for image call.
 */
export interface ImageDataResponse {
  /** Pullimages */
  pullImages: PulledImageData[];
  /** Pushimages */
  pushImages: ToPushImageData[];
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
 * KeycloakConfig
 * Keycloak configuration.
 */
export interface KeycloakConfig {
  /** Realm */
  realm: string;
  /** Url */
  url: string;
  /** Clientid */
  clientId: string;
}

/** LinkDataStoreProject */
export interface LinkDataStoreProject {
  /** service entities are abstractions of upstream services. The main attribute of a service is its URL which can be set as a single string or by specifying the `protocol`, `host`, `port` and `path` individually. */
  route: Service;
  /** A Plugin entity represents a plugin configuration that will be executed during the HTTP request/response lifecycle. */
  keyauth: Plugin;
  /** A Plugin entity represents a plugin configuration that will be executed during the HTTP request/response lifecycle. */
  acl: Plugin;
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

/** ListAnalysisNodes */
export interface ListAnalysisNodes {
  /** Data */
  data: AnalysisNode[];
}

/** ListProjectNodes */
export interface ListProjectNodes {
  /** Data */
  data: ProjectNode[];
}

/**
 * ListRoute200Response
 * ListRoute200Response
 */
export interface ListRoute200Response {
  /** Data */
  data?: Route[] | null;
  /**
   * Offset
   * Offset is used to paginate through the API. Provide this value to the next list operation to fetch the next page
   */
  offset?: string | null;
}

/**
 * ListService200Response
 * ListService200Response
 */
export interface ListService200Response {
  /** Data */
  data?: Service[] | null;
  /**
   * Offset
   * Offset is used to paginate through the API. Provide this value to the next list operation to fetch the next page
   */
  offset?: string | null;
}

/**
 * MasterImage
 * Master image details.
 */
export interface MasterImage {
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
  /** Path */
  path: string;
  /** Virtual Path */
  virtual_path: string;
  /** Group Virtual Path */
  group_virtual_path: string;
  /** Name */
  name: string;
  /** Command */
  command?: string | null;
  /** Command Arguments */
  command_arguments?: string | null;
}

/**
 * Node
 * Node details.
 */
export interface Node {
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
  /** External Name */
  external_name?: string | null;
  /** Name */
  name: string;
  /** Hidden */
  hidden: boolean;
  /** Type */
  type: string;
  /** Online */
  online: boolean;
  /** Registry Id */
  registry_id?: string | null;
  /** Registry Project Id */
  registry_project_id?: string | null;
  /**
   * Robot Id
   * @format uuid
   */
  robot_id: string;
  /**
   * Realm Id
   * @format uuid
   */
  realm_id: string;
}

/**
 * Plugin
 * A Plugin entity represents a plugin configuration that will be executed during the HTTP request/response lifecycle.
 */
export interface Plugin {
  /**
   * Config
   * The configuration properties for the Plugin which can be found on the plugins documentation page in the [Kong Hub](https://docs.konghq.com/hub/).
   */
  config?: object | null;
  consumer?: PluginConsumer | null;
  /**
   * Created At
   * Unix epoch when the resource was created.
   */
  created_at?: number | null;
  /**
   * Enabled
   * Whether the plugin is applied.
   * @default true
   */
  enabled?: boolean | null;
  /** Id */
  id?: string | null;
  /** Instance Name */
  instance_name?: string | null;
  /**
   * Name
   * The name of the Plugin thats going to be added. Currently, the Plugin must be installed in every Kong instance separately.
   */
  name?: string | null;
  /** Ordering */
  ordering?: object | null;
  /**
   * Protocols
   * A list of the request protocols that will trigger this plugin. The default value, as well as the possible values allowed on this field, may change depending on the plugin type. For example, plugins that only work in stream mode will only support `"tcp"` and `"tls"`.
   */
  protocols?: string[] | null;
  route?: PluginRoute | null;
  service?: PluginService | null;
  /**
   * Tags
   * An optional set of strings associated with the Plugin for grouping and filtering.
   */
  tags?: string[] | null;
  /**
   * Updated At
   * Unix epoch when the resource was last updated.
   */
  updated_at?: number | null;
}

/**
 * PluginConsumer
 * If set, the plugin will activate only for requests where the specified has been authenticated. (Note that some plugins can not be restricted to consumers this way.). Leave unset for the plugin to activate regardless of the authenticated Consumer.
 */
export interface PluginConsumer {
  /** Id */
  id?: string | null;
}

/**
 * PluginRoute
 * If set, the plugin will only activate when receiving requests via the specified route. Leave unset for the plugin to activate regardless of the route being used.
 */
export interface PluginRoute {
  /** Id */
  id?: string | null;
}

/**
 * PluginService
 * If set, the plugin will only activate when receiving requests via one of the routes belonging to the specified service. Leave unset for the plugin to activate regardless of the service being matched.
 */
export interface PluginService {
  /** Id */
  id?: string | null;
}

/**
 * Project
 * Single project response model.
 */
export interface Project {
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
  /** Name */
  name: string;
  /** Analyses */
  analyses: number;
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
  /** Master Image Id */
  master_image_id?: string | null;
  master_image?: MasterImage | null;
}

/**
 * ProjectNode
 * Single project or analysis by node.
 */
export interface ProjectNode {
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
  /** Status of project possibilities. */
  approval_status: ApprovalStatus;
  /** Comment */
  comment?: string | null;
  /** Project Id */
  project_id?: string | null;
  /** Project Realm Id */
  project_realm_id?: string | null;
  /** Node Id */
  node_id?: string | null;
  /** Node Realm Id */
  node_realm_id?: string | null;
  project?: Project | null;
  node?: Node | null;
}

/**
 * PulledImageData
 * Pulled image data.
 */
export interface PulledImageData {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Train Class Id */
  train_class_id: string;
  /** Repo Tag */
  repo_tag: string;
  /**
   * Job Id
   * @format uuid
   */
  job_id: string;
  /**
   * Status
   * @default "pulled"
   */
  status?: string;
  /** Labels */
  labels?: object | null;
}

/**
 * Registry
 * Details the registry information.
 */
export interface Registry {
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
  /** Name */
  name?: string | null;
  /** Host */
  host?: string | null;
  /** Account Name */
  account_name?: string | null;
  /** Account Secret */
  account_secret?: string | null;
}

/** RegistryProject */
export interface RegistryProject {
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
  /** Name */
  name?: string | null;
  /** Type */
  type: string;
  /** Public */
  public: boolean;
  /** External Name */
  external_name?: string | null;
  /** External Id */
  external_id?: string | null;
  /** Webhook Name */
  webhook_name?: string | null;
  /** Webhook Exists */
  webhook_exists?: boolean | null;
  /** Account Name */
  account_name?: string | null;
  /** Account Secret */
  account_secret?: string | null;
  /** Registry Id */
  registry_id?: string | null;
  registry?: Registry | null;
  /** Realm Id */
  realm_id?: string | null;
}

/**
 * ResultsUploadResponse
 * Response from uploading a file using the results microservice.
 */
export interface ResultsUploadResponse {
  /** Url */
  url: string;
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
  headers?: object | null;
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
  /**
   * Path
   * @default "/somewhere"
   */
  path?: string | null;
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
 * ToPushImageData
 * Data for images to be pushed.
 */
export interface ToPushImageData {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Train Class Id */
  train_class_id: string;
  /** Repo Tag */
  repo_tag: string;
  /**
   * Job Id
   * @format uuid
   */
  job_id: string;
  /**
   * Status
   * @default "waiting_to_push"
   */
  status?: string;
}

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

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

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
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
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
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
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

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
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

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
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
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  token = {
    /**
     * @description Get a JWT from the IDP by passing a valid username and password. This token can then be used to authenticate yourself with this API.
     *
     * @tags Auth
     * @name GetTokenTokenPost
     * @summary Get a token from the IDP
     * @request POST:/token
     */
    getTokenTokenPost: (data: BodyGetTokenTokenPost, params: RequestParams = {}) =>
      this.request<Token, HTTPValidationError>({
        path: `/token`,
        method: "POST",
        body: data,
        type: ContentType.UrlEncoded,
        format: "json",
        ...params,
      }),

    /**
     * @description Return information about the provided token.
     *
     * @tags Auth
     * @name InspectTokenTokenInspectPost
     * @summary Get information about a provided token from the IDP
     * @request POST:/token/inspect
     */
    inspectTokenTokenInspectPost: (data: BodyInspectTokenTokenInspectPost, params: RequestParams = {}) =>
      this.request<object, HTTPValidationError>({
        path: `/token/inspect`,
        method: "POST",
        body: data,
        type: ContentType.UrlEncoded,
        format: "json",
        ...params,
      }),
  };
  containers = {
    /**
     * @description Return information about the provided token.
     *
     * @name FetchContainersContainersGet
     * @summary Fetch Containers
     * @request GET:/containers
     */
    fetchContainersContainersGet: (params: RequestParams = {}) =>
      this.request<any[], any>({
        path: `/containers`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  po = {
    /**
     * @description Create an analysis pod.
     *
     * @tags PodOrc
     * @name CreateAnalysisPoPost
     * @summary Create Analysis
     * @request POST:/po
     * @secure
     */
    createAnalysisPoPost: (data: BodyCreateAnalysisPoPost, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/po`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the logs for a specific analysis run.
     *
     * @tags PodOrc
     * @name GetAnalysisLogsPoAnalysisIdLogsGet
     * @summary Get Analysis Logs
     * @request GET:/po/{analysis_id}/logs
     * @secure
     */
    getAnalysisLogsPoAnalysisIdLogsGet: (analysisId: string | null, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/po/${analysisId}/logs`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the status for a specific analysis run.
     *
     * @tags PodOrc
     * @name GetAnalysisStatusPoAnalysisIdStatusGet
     * @summary Get Analysis Status
     * @request GET:/po/{analysis_id}/status
     * @secure
     */
    getAnalysisStatusPoAnalysisIdStatusGet: (analysisId: string | null, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/po/${analysisId}/status`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the pods for a specific analysis run.
     *
     * @tags PodOrc
     * @name GetAnalysisPodsPoAnalysisIdPodsGet
     * @summary Get Analysis Pods
     * @request GET:/po/{analysis_id}/pods
     * @secure
     */
    getAnalysisPodsPoAnalysisIdPodsGet: (analysisId: string | null, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/po/${analysisId}/pods`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Stop a specific analysis run.
     *
     * @tags PodOrc
     * @name StopAnalysisPoAnalysisIdStopPut
     * @summary Stop Analysis
     * @request PUT:/po/{analysis_id}/stop
     * @secure
     */
    stopAnalysisPoAnalysisIdStopPut: (analysisId: string | null, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/po/${analysisId}/stop`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a specific analysis run.
     *
     * @tags PodOrc
     * @name DeleteAnalysisPoAnalysisIdDeleteDelete
     * @summary Delete Analysis
     * @request DELETE:/po/{analysis_id}/delete
     * @secure
     */
    deleteAnalysisPoAnalysisIdDeleteDelete: (analysisId: string | null, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/po/${analysisId}/delete`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  local = {
    /**
     * @description Get a local result as file from local storage.
     *
     * @tags Results
     * @name RetrieveIntermediateResultFromLocalLocalObjectIdGet
     * @summary Retrieve Intermediate Result From Local
     * @request GET:/local/{object_id}
     * @secure
     */
    retrieveIntermediateResultFromLocalLocalObjectIdGet: (objectId: string, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/local/${objectId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Results
     * @name SubmitIntermediateResultToLocalLocalPut
     * @summary Submit Intermediate Result To Local
     * @request PUT:/local
     * @secure
     */
    submitIntermediateResultToLocalLocalPut: (
      data: BodySubmitIntermediateResultToLocalLocalPut,
      params: RequestParams = {},
    ) =>
      this.request<ResultsUploadResponse, void | HTTPValidationError>({
        path: `/local`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  intermediate = {
    /**
     * @description Get an intermediate result as file from the FLAME Hub.
     *
     * @tags Results
     * @name RetrieveIntermediateResultFromHubIntermediateObjectIdGet
     * @summary Retrieve Intermediate Result From Hub
     * @request GET:/intermediate/{object_id}
     * @secure
     */
    retrieveIntermediateResultFromHubIntermediateObjectIdGet: (objectId: string, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/intermediate/${objectId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload a file as an intermediate result to the FLAME Hub. Returns a 202 on success. This endpoint returns immediately and submits the file in the background.
     *
     * @tags Results
     * @name SubmitIntermediateResultToHubIntermediatePut
     * @summary Submit Intermediate Result To Hub
     * @request PUT:/intermediate
     * @secure
     */
    submitIntermediateResultToHubIntermediatePut: (
      data: BodySubmitIntermediateResultToHubIntermediatePut,
      params: RequestParams = {},
    ) =>
      this.request<ResultsUploadResponse, void | HTTPValidationError>({
        path: `/intermediate`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  final = {
    /**
     * @description Upload final results to FLAME Hub
     *
     * @tags Results
     * @name SubmitFinalResultToHubFinalPut
     * @summary Submit Final Result To Hub
     * @request PUT:/final
     * @secure
     */
    submitFinalResultToHubFinalPut: (data: BodySubmitFinalResultToHubFinalPut, params: RequestParams = {}) =>
      this.request<void, void | HTTPValidationError>({
        path: `/final`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),
  };
  metadata = {
    /**
     * @description Return keycloak metadata for the frontend.
     *
     * @tags Metadata
     * @name GetKeycloakConfigMetadataKeycloakConfigGet
     * @summary Get Keycloak Config
     * @request GET:/metadata/keycloakConfig
     */
    getKeycloakConfigMetadataKeycloakConfigGet: (params: RequestParams = {}) =>
      this.request<KeycloakConfig, void>({
        path: `/metadata/keycloakConfig`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Return version of the node software/API.
     *
     * @tags Metadata
     * @name GetNodeVersionMetadataVersionGet
     * @summary Get Node Version
     * @request GET:/metadata/version
     */
    getNodeVersionMetadataVersionGet: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/metadata/version`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  vault = {
    /**
     * @description Spoof vault status.
     *
     * @tags Metadata
     * @name GetVaultStatusVaultStatusGet
     * @summary Get Vault Status
     * @request GET:/vault/status
     */
    getVaultStatusVaultStatusGet: (params: RequestParams = {}) =>
      this.request<any, void>({
        path: `/vault/status`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  hub = {
    /**
     * @description Return list of images for the frontend.
     *
     * @tags Metadata
     * @name GetImagesHubImagesGet
     * @summary Get Images
     * @request GET:/hub/images
     */
    getImagesHubImagesGet: (params: RequestParams = {}) =>
      this.request<ImageDataResponse, void>({
        path: `/hub/images`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  projects = {
    /**
     * @description List all projects.
     *
     * @tags Hub
     * @name ListAllProjectsProjectsGet
     * @summary List All Projects
     * @request GET:/projects
     * @secure
     */
    listAllProjectsProjectsGet: (
      query?: {
        /**
         * Include
         * Whether to include additional data. Can only be 'master_image' or null
         */
        include?: string | null;
        /**
         * Filter Id
         * Filter by object UUID.
         * @format uuid
         */
        filter_id?: string;
        /**
         * Filter Realm Id
         * Filter by realm UUID.
         * @format uuid
         */
        filter_realm_id?: string;
        /**
         * Filter User Id
         * Filter by user UUID.
         * @format uuid
         */
        filter_user_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<AllProjects, void | HTTPValidationError>({
        path: `/projects`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List project for a given UUID.
     *
     * @tags Hub
     * @name ListSpecificProjectProjectsProjectIdGet
     * @summary List Specific Project
     * @request GET:/projects/{project_id}
     * @secure
     */
    listSpecificProjectProjectsProjectIdGet: (projectId: string, params: RequestParams = {}) =>
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
     * @name ListProjectProposalsProjectNodesGet
     * @summary List Project Proposals
     * @request GET:/project-nodes
     * @secure
     */
    listProjectProposalsProjectNodesGet: (
      query?: {
        /**
         * Include
         * Whether to include additional data for the given parameter. Choices: 'node'/'project'
         * @default "project,node"
         */
        include?: string | null;
        /**
         * Filter Id
         * Filter by ID of returned object.
         */
        filter_id?: string | null;
        /**
         * Filter Project Id
         * Filter by project UUID.
         */
        filter_project_id?: string | null;
        /**
         * Filter Project Realm Id
         * Filter by project realm UUID.
         */
        filter_project_realm_id?: string | null;
        /**
         * Filter Node Id
         * Filter by node UUID.
         */
        filter_node_id?: string | null;
        /**
         * Filter Node Realm Id
         * Filter by node realm UUID.
         */
        filter_node_realm_id?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListProjectNodes, void | HTTPValidationError>({
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
     * @name AcceptRejectProjectProposalProjectNodesProposalIdPost
     * @summary Accept Reject Project Proposal
     * @request POST:/project-nodes/{proposal_id}
     * @secure
     */
    acceptRejectProjectProposalProjectNodesProposalIdPost: (
      proposalId: string,
      data: BodyAcceptRejectProjectProposalProjectNodesProposalIdPost,
      params: RequestParams = {},
    ) =>
      this.request<ProjectNode, void | HTTPValidationError>({
        path: `/project-nodes/${proposalId}`,
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
     * @description List analyses for a node.
     *
     * @tags Hub
     * @name ListAnalysesOfNodesAnalysisNodesGet
     * @summary List Analyses Of Nodes
     * @request GET:/analysis-nodes
     * @secure
     */
    listAnalysesOfNodesAnalysisNodesGet: (
      query?: {
        /**
         * Include
         * Whether to include additional data for the given parameter. Can only be 'node'/'analysis'
         * @default "analysis"
         */
        include?: string | null;
        /**
         * Filter Id
         * Filter by ID of returned object.
         */
        filter_id?: string | null;
        /**
         * Filter Project Id
         * Filter by project UUID.
         */
        filter_project_id?: string | null;
        /**
         * Filter Project Realm Id
         * Filter by project realm UUID.
         */
        filter_project_realm_id?: string | null;
        /**
         * Filter Node Id
         * Filter by node UUID.
         */
        filter_node_id?: string | null;
        /**
         * Filter Node Realm Id
         * Filter by node realm UUID.
         */
        filter_node_realm_id?: string | null;
        /**
         * Filter Analysis Id
         * Filter by analysis UUID.
         */
        filter_analysis_id?: string | null;
        /**
         * Filter Analysis Realm Id
         * Filter by analysis realm UUID.
         */
        filter_analysis_realm_id?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListAnalysisNodes, void | HTTPValidationError>({
        path: `/analysis-nodes`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description List project for a given UUID.
     *
     * @tags Hub
     * @name ListSpecificAnalysisAnalysisNodesAnalysisIdGet
     * @summary List Specific Analysis
     * @request GET:/analysis-nodes/{analysis_id}
     * @secure
     */
    listSpecificAnalysisAnalysisNodesAnalysisIdGet: (
      analysisId: string,
      query?: {
        /**
         * Include
         * Whether to include additional data for the given parameter. Can only be 'node'/'analysis'
         * @default "analysis"
         */
        include?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AnalysisNode, void | HTTPValidationError>({
        path: `/analysis-nodes/${analysisId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Set the approval status of a analysis.
     *
     * @tags Hub
     * @name AcceptRejectAnalysisNodeAnalysisNodesAnalysisIdPost
     * @summary Accept Reject Analysis Node
     * @request POST:/analysis-nodes/{analysis_id}
     * @secure
     */
    acceptRejectAnalysisNodeAnalysisNodesAnalysisIdPost: (
      analysisId: string,
      data: BodyAcceptRejectAnalysisNodeAnalysisNodesAnalysisIdPost,
      params: RequestParams = {},
    ) =>
      this.request<AnalysisNode, void | HTTPValidationError>({
        path: `/analysis-nodes/${analysisId}`,
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
     * @description List project for a given UUID.
     *
     * @tags Hub
     * @name ListAllAnalysesAnalysesGet
     * @summary List All Analyses
     * @request GET:/analyses
     * @secure
     */
    listAllAnalysesAnalysesGet: (
      query?: {
        /**
         * Include
         * Whether to include additional data for the given parameter. Can only be 'node'/'analysis'
         * @default "project"
         */
        include?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AllAnalyses, void | HTTPValidationError>({
        path: `/analyses`,
        method: "GET",
        query: query,
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
     * @name GetRegistryMetadataForProjectRegistryProjectsRegistryProjectIdGet
     * @summary Get Registry Metadata For Project
     * @request GET:/registry-projects/{registry_project_id}
     * @secure
     */
    getRegistryMetadataForProjectRegistryProjectsRegistryProjectIdGet: (
      registryProjectId: string,
      query?: {
        /**
         * Include
         * Whether to include additional registry data. Can only be 'registry'
         * @default "registry"
         */
        include?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<RegistryProject, void | HTTPValidationError>({
        path: `/registry-projects/${registryProjectId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  analysis = {
    /**
     * @description Build an analysis image URL using its metadata from the Hub.
     *
     * @tags Hub
     * @name GetAnalysisImageUrlAnalysisImageAnalysisIdGet
     * @summary Get Analysis Image Url
     * @request GET:/analysis/image/{analysis_id}
     * @secure
     */
    getAnalysisImageUrlAnalysisImageAnalysisIdGet: (analysisId: string, params: RequestParams = {}) =>
      this.request<AnalysisImageUrl, void | HTTPValidationError>({
        path: `/analysis/image/${analysisId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  kong = {
    /**
     * @description List all available data stores.
     *
     * @tags Kong
     * @name ListDataStoresKongDatastoreGet
     * @summary List Data Stores
     * @request GET:/kong/datastore
     */
    listDataStoresKongDatastoreGet: (params: RequestParams = {}) =>
      this.request<ListService200Response, void>({
        path: `/kong/datastore`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Create a datastore by providing necessary metadata.
     *
     * @tags Kong
     * @name CreateDataStoreKongDatastorePost
     * @summary Create Data Store
     * @request POST:/kong/datastore
     */
    createDataStoreKongDatastorePost: (data: ServiceRequest, params: RequestParams = {}) =>
      this.request<Service, void | HTTPValidationError>({
        path: `/kong/datastore`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete the listed data store.
     *
     * @tags Kong
     * @name DeleteDataStoreKongDatastoreDataStoreNameDelete
     * @summary Delete Data Store
     * @request DELETE:/kong/datastore/{data_store_name}
     */
    deleteDataStoreKongDatastoreDataStoreNameDelete: (dataStoreName: string, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/datastore/${dataStoreName}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description List all the routes available, can be filtered by project_id.
     *
     * @tags Kong
     * @name ListRoutesKongRouteGet
     * @summary List Routes
     * @request GET:/kong/route
     */
    listRoutesKongRouteGet: (
      query?: {
        /**
         * Project Id
         * UUID of project.
         */
        project_id?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListRoute200Response, void | HTTPValidationError>({
        path: `/kong/route`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a route between a data store and a project.
     *
     * @tags Kong
     * @name CreateRouteBetweenDatastoreAndProjectKongRoutePost
     * @summary Create Route Between Datastore And Project
     * @request POST:/kong/route
     */
    createRouteBetweenDatastoreAndProjectKongRoutePost: (
      data: BodyCreateRouteBetweenDatastoreAndProjectKongRoutePost,
      params: RequestParams = {},
    ) =>
      this.request<LinkDataStoreProject, void | HTTPValidationError>({
        path: `/kong/route`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Disconnect a project from all connected data stores.
     *
     * @tags Kong
     * @name DisconnectProjectKongRouteDisconnectProjectIdPut
     * @summary Disconnect Project
     * @request PUT:/kong/route/disconnect/{project_id}
     */
    disconnectProjectKongRouteDisconnectProjectIdPut: (projectId: string, params: RequestParams = {}) =>
      this.request<Disconnect, void | HTTPValidationError>({
        path: `/kong/route/disconnect/${projectId}`,
        method: "PUT",
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new analysis and link it to a project.
     *
     * @tags Kong
     * @name CreateAndConnectAnalysisToProjectKongAnalysisPost
     * @summary Create And Connect Analysis To Project
     * @request POST:/kong/analysis
     */
    createAndConnectAnalysisToProjectKongAnalysisPost: (
      data: BodyCreateAndConnectAnalysisToProjectKongAnalysisPost,
      params: RequestParams = {},
    ) =>
      this.request<LinkProjectAnalysis, void | HTTPValidationError>({
        path: `/kong/analysis`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete the listed analysis.
     *
     * @tags Kong
     * @name DeleteAnalysisKongAnalysisAnalysisIdDelete
     * @summary Delete Analysis
     * @request DELETE:/kong/analysis/{analysis_id}
     */
    deleteAnalysisKongAnalysisAnalysisIdDelete: (analysisId: string, params: RequestParams = {}) =>
      this.request<any, void | HTTPValidationError>({
        path: `/kong/analysis/${analysisId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),
  };
  healthz = {
    /**
     * @description ## Perform a Health Check Endpoint to perform a healthcheck on. This endpoint can primarily be used Docker to ensure a robust container orchestration and management is in place. Other services which rely on proper functioning of the API service will not deploy if this endpoint returns any other HTTP status code except 200 (OK). Returns: HealthCheck: Returns a JSON response with the health status
     *
     * @tags Health
     * @name GetHealthHealthzGet
     * @summary Perform a Health Check
     * @request GET:/healthz
     */
    getHealthHealthzGet: (params: RequestParams = {}) =>
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
     * @name GetHealthDownstreamServicesHealthServicesGet
     * @summary Perform a Health Check on the downstream microservices
     * @request GET:/health/services
     */
    getHealthDownstreamServicesHealthServicesGet: (params: RequestParams = {}) =>
      this.request<DownstreamHealthCheck, any>({
        path: `/health/services`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
