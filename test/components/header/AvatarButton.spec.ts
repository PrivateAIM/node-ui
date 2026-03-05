import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils"; // add flushPromises
import { useRuntimeConfig } from "nuxt/app";
import { beforeAll, describe, expect, it, vi } from "vitest";
import AvatarButton from "~/components/header/AvatarButton.vue";
import { useAuth, useAuthState } from "@/test/mockapi/nuxt-auth-mock";

describe("AvatarButton.vue", () => {
  const testUser = "Johnny Storm";
  let AvatarButtonTestComponent: typeof AvatarButton;

  vi.mocked(useRuntimeConfig);

  beforeAll(() => {
    AvatarButtonTestComponent = defineComponent({
      components: { AvatarButton },
      template: "<Suspense><AvatarButton/></Suspense>",
    });
  });

  async function avatarMenuChecks(authenticated: boolean) {
    const status = authenticated ? "authenticated" : "unauthenticated";
    const expectedIcon = authenticated ? "pi-user" : "pi-question";
    const logPrompt = authenticated ? "Logout" : "Login";
    const userData = authenticated ? { user: { name: testUser } } : {};

    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(useAuthState).mockReturnValue({
      status: ref(status),
      data: ref(userData),
    });

    const wrapper = mount(AvatarButtonTestComponent, {
      global: {
        stubs: {
          teleport: true,
          CleanupDialog: true,
          PreferencesDialog: true,
        },
      },
    });

    // flushPromises resolves all pending promises including the async setup
    await flushPromises();

    expect(wrapper).toBeTruthy();

    const avatarBtn = wrapper.find(".avatar-btn");
    const avatarName = wrapper.find(".username-menu-bar");
    expect(avatarBtn.find("span").attributes()["class"]).toContain(
      expectedIcon,
    );

    if (authenticated) {
      expect(avatarName.text()).toBeTruthy();
      expect(avatarName.text()).toBe(testUser);
    }

    await avatarBtn.trigger("click");
    await flushPromises(); // use flushPromises here too for consistency

    const menu = wrapper.find(".avatar-menu");
    expect(menu.text()).toContain("Keycloak");
    expect(menu.text()).toContain(logPrompt);

    const keycloakAdminBtn = menu
      .findAll("a")
      .find((e1) => e1.text() === "Node Keycloak Admin");
    if (keycloakAdminBtn) {
      expect(keycloakAdminBtn.attributes()["href"]).toBe(
        "https://fakenode.com/keycloak/admin",
      );
    } else {
      throw new Error("Keycloak button not found in avatar menu");
    }
  }

  it("Unauthenticated avatar menu", async () => {
    await avatarMenuChecks(false);
  });

  it("Authenticated avatar menu", async () => {
    await avatarMenuChecks(true);
  });
});
