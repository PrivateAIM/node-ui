import { useFetch, useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { vi, describe, test, expect, beforeAll, beforeEach } from "vitest";
import DataStoreTreeTable from "~/components/data-stores/tables/DataStoreTreeTable.vue";
import {
  fakeAnalysisNodes,
  fakeProjects,
} from "~/test/components/analysis/constants";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import type { ListAnalysisNodes } from "~/services/Api";
import { fakeDataStoreTableProps } from "~/test/components/data-stores/constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisNodes: vi.fn(),
}));

describe("DataStoreTreeTable.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DataStoreTreeTable, {
      props: {
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
          ["8003eefe-e39b-4bd4-aec4-78046c63b39b", "T004"],
        ]),
        projectNameMap: new Map<string, string>([
          ["7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483", "denbi-test"],
        ]),
      },
    });
  });

  test("Return analysis node data", async () => {
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(fakeAnalysisNodes),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(useFetch).mockResolvedValue({
      data: ref(fakeProjects),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });
    vi.mocked(useNuxtApp);

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    expect(AnalysisTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Analyses"); // H1 of the page

    // Find header and all rows
    const headerRow = wrapper.findAll("thead tr");
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(3); // Ensure 3 rows exist as defined in fakeAnalysisNodes

    // Verify header contents
    expect(headerRow.length).toBe(1);
    const headerCols = headerRow[0].findAll("th");
    expect(headerCols[0].text()).toBe("Name"); // First col
    expect(headerCols[7].text()).toBe("Toggle Analysis"); // Last col

    // Verify the second row's content
    const secondRowCells = rows[1].findAll("td");
    expect(secondRowCells[0].text()).toBe("T004"); // Name
    expect(secondRowCells[1].text()).toBe("approved"); // Approval status
    expect(secondRowCells[6].text()).toBe("14.03.2025"); // Last Updated
  });

  test("No analyses returned", async () => {
    const emptyResp: ListAnalysisNodes = { data: [], meta: {} };
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(emptyResp),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(useFetch).mockResolvedValue({
      data: ref({ data: [] }),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });
    vi.mocked(useNuxtApp);

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    expect(AnalysisTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No analyses found"); // H1 of the page
  });
});
