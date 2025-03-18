import { defineComponent } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, test, expect, beforeEach } from "vitest";
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/analyses/:id", component: ContainerLogs }],
});

describe("ContainerLogs.vue", () => {
  let wrapper;
  beforeEach(async () => {
    const TestComponent = defineComponent({
      components: { ContainerLogs },
      template: "<Suspense><ContainerLogs/></Suspense>",
    });
    router.push("/analyses/85629f5b-da04-4f7c-84fc-097b2db93de5"); // Set route param
    await router.isReady(); // Wait for router to be ready

    wrapper = mount(TestComponent, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
  });

  test("Get the logs from the API", async () => {
    expect(wrapper.vm.$route.params.id).toBe(
      "85629f5b-da04-4f7c-84fc-097b2db93de5",
    );
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");
  });
});
