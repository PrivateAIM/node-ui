import { flushPromises, mount } from "@vue/test-utils";
import { useRuntimeConfig } from "nuxt/app";
import { beforeAll, describe, expect, it, vi } from "vitest";
import MenuHeader from "~/components/header/MenuHeader.vue";
import { type DefineComponent, defineComponent } from "vue";

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
      "Events",
      "Data Stores",
    ];

    vi.stubGlobal("useAuth", () => ({
      status: ref(status),
    }));

    const wrapper = mount(MenuHeaderTestComponent);
    expect(wrapper).toBeTruthy();
    await flushPromises();

    const menuBar = wrapper.find(".menu-bar-header");

    menuTitles.forEach((title, index) => {
      const menuItem = menuBar.find(`li[aria-label="${title}"]`);

      expect(menuItem.attributes()["aria-posinset"]).toBe(`${index + 1}`); // Top level menu item
      const menuLink = menuItem.find(".p-menubar-item-link");

      if (!authenticated && title !== "Home") {
        expect(menuLink.classes()).toContain("p-disabled");
      } else {
        expect(menuLink.classes()).toContain("enabled");
      }
    });
  }

  it("Unauthenticated menu header", async () => {
    await menuHeaderChecks(false);
  });

  it("Authenticated menu header", async () => {
    await menuHeaderChecks(true);
  });
});
