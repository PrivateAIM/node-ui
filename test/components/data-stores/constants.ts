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
