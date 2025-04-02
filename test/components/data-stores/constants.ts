import {
  type AllAnalyses,
  type AllProjects,
  AnalysisBuildStatus,
  type ListConsumers,
  type ListServices,
} from "~/services/Api";

export const validProjectId = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
export const duplicateProjectId = "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f";

export const fakeParsedProjects = [
  {
    dropdown: "my-fake-project-1 (7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483)",
    id: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
    name: "my-fake-project-1",
  },
  {
    dropdown: "my-fake-project-2 (bab3aa4f-9144-444c-8ec7-6ebbbe8e300f)",
    id: "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f",
    name: "my-fake-project-2",
  },
];

export const fakeDataStoreInitSuccess = {
  route: {
    created_at: 1743059035,
    destinations: null,
    headers: null,
    hosts: null,
    https_redirect_status_code: 426,
    id: "abbbf2f8-0c2d-4c23-a2dc-d3ebb5cf9708",
    methods: ["GET"],
    name: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483-fhir",
    path_handling: "v0",
    paths: ["/7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483/fhir"],
    preserve_host: false,
    protocols: ["http"],
    regex_priority: 0,
    request_buffering: true,
    response_buffering: true,
    service: {
      id: "2ad18d4d-395a-49f3-a553-981a02f52422",
    },
    snis: null,
    sources: null,
    strip_path: true,
    tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "fhir"],
    updated_at: 1743059035,
  },
  keyauth: {
    consumer: null,
    created_at: 1743059035,
    id: "5c9c94ba-5f87-4994-b5a2-e1861271169a",
    key: null,
    tags: null,
  },
  acl: {
    consumer: null,
    created_at: 1743059035,
    id: "6b908793-a76b-43de-bfbc-502b11794dde",
    group: null,
    tags: null,
  },
};
export const fakeDatastoreTreeTableProps = {
  dataStoreList: [
    {
      ca_certificates: null,
      client_certificate: null,
      connect_timeout: 6000,
      created_at: {
        short: "27.03.2025",
        long: "Thu, 27 Mar 2025 07:03:55 GMT",
        date: "2025-03-27T07:03:55.000Z",
        timestamp: 1743059035,
      },
      enabled: true,
      host: "whonnock",
      id: "2ad18d4d-395a-49f3-a553-981a02f52422",
      name: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
      path: "/foo",
      port: 80,
      protocol: "http",
      read_timeout: 6000,
      retries: 5,
      tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483"],
      tls_verify: null,
      tls_verify_depth: null,
      updated_at: {
        short: "27.03.2025",
        long: "Thu, 27 Mar 2025 07:03:55 GMT",
        date: "2025-03-27T07:03:55.000Z",
        timestamp: 1743059035,
      },
      url: null,
      write_timeout: 6000,
      routes: [
        {
          created_at: {
            short: "27.03.2025",
            long: "Thu, 27 Mar 2025 07:03:55 GMT",
            date: "2025-03-27T07:03:55.000Z",
            timestamp: 1743059035,
          },
          destinations: null,
          headers: null,
          hosts: null,
          https_redirect_status_code: 426,
          id: "abbbf2f8-0c2d-4c23-a2dc-d3ebb5cf9708",
          methods: ["GET"],
          name: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483-fhir",
          path_handling: "v0",
          paths: ["/7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483/fhir"],
          preserve_host: false,
          protocols: ["http"],
          regex_priority: 0,
          request_buffering: true,
          response_buffering: true,
          service: { id: "2ad18d4d-395a-49f3-a553-981a02f52422" },
          snis: null,
          sources: null,
          strip_path: true,
          tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "fhir"],
          updated_at: {
            short: "27.03.2025",
            long: "Thu, 27 Mar 2025 07:03:55 GMT",
            date: "2025-03-27T07:03:55.000Z",
            timestamp: 1743059035,
          },
          expand: {},
          projectId: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
        },
      ],
      expand: {},
    },
  ],
  analyses: [
    {
      created_at: {
        short: "28.03.2025",
        long: "Fri, 28 Mar 2025 07:53:26 GMT",
        date: "2025-03-28T07:53:26.000Z",
        timestamp: 1743148406,
      },
      custom_id: "analysis-8003eefe-e39b-4bd4-aec4-78046c63b39b9271",
      id: "09d4fa77-9a97-4bab-bab6-6fff3290c716",
      tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483"],
      username: "analysis-8003eefe-e39b-4bd4-aec4-78046c63b39b9271",
    },
    {
      created_at: {
        short: "28.03.2025",
        long: "Fri, 28 Mar 2025 07:53:25 GMT",
        date: "2025-03-28T07:53:25.000Z",
        timestamp: 1743148405,
      },
      custom_id: "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
      id: "189b117b-1563-42a1-a044-ef18bf4000b9",
      tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483"],
      username: "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
    },
  ],
  analysisNameMap: new Map<string, string>([
    ["8003eefe-e39b-4bd4-aec4-78046c63b39b", "ds-analysis-test"],
  ]),
  projectNameMap: new Map<string, string>([
    ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "ds-project-test"],
  ]),
};
export const fakeDetailedAnalysisTableProps = {
  detailedAnalysisList: [
    {
      created_at: {
        short: "28.03.2025",
        long: "Fri, 28 Mar 2025 07:53:25 GMT",
        date: "2025-03-28T07:53:25.000Z",
        timestamp: 1743148405,
      },
      custom_id: "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
      id: "189b117b-1563-42a1-a044-ef18bf4000b9",
      tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483"],
      username: "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
      expand: {},
    },
  ],
  analysisNameMap: new Map<string, string>([
    ["8003eefe-e39b-4bd4-aec4-78046c63b39b", "ds-analysis-test"],
  ]),
  projectNameMap: new Map<string, string>([
    ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "ds-project-test"],
  ]),
};

export const fakeProjectResp: AllProjects = {
  data: [
    {
      id: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
      created_at: "2025-01-28T14:58:02.143000Z",
      updated_at: "2025-02-14T09:05:02Z",
      name: "ds-project-test",
      analyses: 17,
      realm_id: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
      user_id: "5ec456e2-e30c-4a29-96de-6425fe5b9355",
      master_image_id: null,
      master_image: null,
    },
  ],
  meta: {},
};
export const fakeAnalysisResp: AllAnalyses = {
  data: [
    {
      id: "8003eefe-e39b-4bd4-aec4-78046c63b39b",
      created_at: "2025-02-05T10:15:22.833000Z",
      updated_at: "2025-03-20T10:05:26Z",
      name: "T004",
      nodes: 2,
      configuration_status: null,
      build_status: AnalysisBuildStatus.Finished,
      run_status: null,
      registry_id: "bab3aa4f-9144-444c-8ec7-6ebbbe8e300f",
      realm_id: "ab1fbc92-3dc8-4bdd-9d51-3b571c2d7aaa",
      user_id: "5ec456e2-e30c-4a29-96de-6425fe5b9355",
      project_id: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
      project: null,
      master_image_id: null,
      registry: null,
      master_image: null,
    },
  ],
  meta: {},
};
export const fakeConsumerResp: ListConsumers = {
  data: [
    {
      created_at: 1743148405,
      custom_id: "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
      id: "189b117b-1563-42a1-a044-ef18bf4000b9",
      tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483"],
      username: "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
    },
  ],
};
export const fakeDataStoreResp: ListServices = {
  data: [
    {
      ca_certificates: null,
      client_certificate: null,
      connect_timeout: 6000,
      created_at: 1743059035,
      enabled: true,
      host: "whonnock",
      id: "2ad18d4d-395a-49f3-a553-981a02f52422",
      name: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483",
      path: "/foo",
      port: 80,
      protocol: "http",
      read_timeout: 6000,
      retries: 5,
      tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483"],
      tls_verify: null,
      tls_verify_depth: null,
      updated_at: 1743059035,
      url: null,
      write_timeout: 6000,
      routes: [
        {
          created_at: 1743059035,
          destinations: null,
          headers: null,
          hosts: null,
          https_redirect_status_code: 426,
          id: "abbbf2f8-0c2d-4c23-a2dc-d3ebb5cf9708",
          methods: ["GET"],
          name: "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483-fhir",
          path_handling: "v0",
          paths: ["/7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483/fhir"],
          preserve_host: false,
          protocols: ["http"],
          regex_priority: 0,
          request_buffering: true,
          response_buffering: true,
          service: { id: "2ad18d4d-395a-49f3-a553-981a02f52422" },
          snis: null,
          sources: null,
          strip_path: true,
          tags: ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "fhir"],
          updated_at: 1743059035,
        },
      ],
    },
  ],
};
