import { flushPromises, mount } from "@vue/test-utils";
import { useRuntimeConfig } from "nuxt/app";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Menubar from "primevue/menubar";
import MenuHeader from "~/components/header/MenuHeader.vue";
import { type DefineComponent, defineComponent, ref } from "vue";
import { useAuthState } from "@/test/mockapi/nuxt-auth-mock";

/** One row of `allLinks`; only the fields the nav assertions care about. */
interface MenuLink {
  label: string;
  route?: string;
}

describe("MenuHeader.vue", () => {
  vi.mocked(useRuntimeConfig);

  let MenuHeaderTestComponent: DefineComponent<typeof defineComponent>;

  // Render the component with the fake params
  beforeAll(async () => {
    MenuHeaderTestComponent = defineComponent({
      components: { MenuHeader },
      template: "<Suspense><MenuHeader/></Suspense>",
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

    const wrapper = mount(MenuHeaderTestComponent, {
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

    const wrapper = mount(MenuHeaderTestComponent, {
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
    // slot renders a `router-link`, which the test router resolves to "/" for any route
    // this suite has not registered - so a typo'd path would still render plausibly.
    const model = wrapper.findComponent(Menubar).props("model") as MenuLink[];

    expect(model.find((item) => item.label === "Uptime")?.route).toBe(
      "/uptime",
    );
  });
});
