import { flushPromises, mount } from "@vue/test-utils";
import { useRuntimeConfig } from "nuxt/app";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Menubar from "primevue/menubar";
import AppHeader from "~/components/app/AppHeader.vue";
import { type DefineComponent, defineComponent, ref } from "vue";
import { useAuthState } from "@/test/mockapi/nuxt-auth-mock";

/** One row of `allLinks`; only the fields the nav assertions care about. */
interface MenuLink {
  label: string;
  route?: string;
}

describe("AppHeader.vue", () => {
  vi.mocked(useRuntimeConfig);

  let AppHeaderTestComponent: DefineComponent<typeof defineComponent>;

  // Render the component with the fake params
  beforeAll(async () => {
    AppHeaderTestComponent = defineComponent({
      components: { AppHeader },
      template: "<Suspense><AppHeader/></Suspense>",
    });
  });

  async function menuHeaderChecks(authenticated: boolean) {
    const status = authenticated ? "authenticated" : "unauthenticated";
    const menuTitles = [
      "Home",
      "Projects",
      "Analyses",
      "Data Stores",
      "Events",
      "Uptime",
    ];

    vi.mocked(useAuthState).mockReturnValue({
      status: ref(status),
      data: ref(null),
    });

    const wrapper = mount(AppHeaderTestComponent, {
      global: {
        stubs: { AvatarButton: true, DarkModeToggle: true, PreferencesDialog: true },
      },
    });
    expect(wrapper).toBeTruthy();
    await flushPromises();

    const menuBar = wrapper.find(".menu-bar-header");

    menuTitles.forEach((title, index) => {
      const menuItem = menuBar.find(`li[aria-label="${title}"]`);

      if (!authenticated && title !== "Home") {
        // Non-Home items are filtered out (not just disabled) when unauthenticated
        expect(menuItem.exists()).toBe(false);
      } else {
        expect(menuItem.exists()).toBe(true);
        expect(menuItem.attributes()["aria-posinset"]).toBe(`${index + 1}`); // Top level menu item
      }
    });
  }

  it("Unauthenticated menu header", async () => {
    await menuHeaderChecks(false);
  });

  it("Authenticated menu header", async () => {
    await menuHeaderChecks(true);
  });

  it("points the Uptime tab at the uptime page", async () => {
    vi.mocked(useAuthState).mockReturnValue({
      status: ref("authenticated"),
      data: ref(null),
    });

    const wrapper = mount(AppHeaderTestComponent, {
      global: {
        stubs: {
          AvatarButton: true,
          DarkModeToggle: true,
          PreferencesDialog: true,
        },
      },
    });
    await flushPromises();

    // Read the route off the model rather than the rendered `href`: the custom `#item`
    // slot renders a `NuxtLink`, which the test setup stubs without an `href` - so a
    // typo'd path would still render plausibly.
    const model = wrapper.findComponent(Menubar).props("model") as MenuLink[];

    expect(model.find((item) => item.label === "Uptime")?.route).toBe(
      "/uptime",
    );
  });
});
