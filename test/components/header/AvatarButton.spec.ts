import { mount } from "@vue/test-utils";
import { useRuntimeConfig } from "#app";
import { vi, describe, it, expect, afterEach } from "vitest";
import AvatarButton from "~/components/header/AvatarButton.vue";

vi.mock("#app", () => ({
  useRuntimeConfig: vi.fn(),
}));

describe("AvatarButton.vue", () => {
  const testUser = "Johnny Storm";

  vi.mocked(useRuntimeConfig).mockReturnValue({
    public: {
      baseUrl: "https://fakenode.com",
      // @ts-expect-error Primevue props not needed
      primevue: vi.fn(),
      hubAdapterUrl: "https://fakenode.com/api",
      keycloakBaseUrl: "https://fakenode.com/keycloak/realms/flame",
      auth: {
        baseURL: "https://fakenode.com/flame/api/auth",
        disableInternalRouting: false,
        disableServerSideAuth: false,
        globalAppMiddleware: true,
        isEnabled: true,
        originEnvKey: "NUXT_PUBLIC_ORIGIN",
        provider: {
          addDefaultCallbackUrl: true,
          defaultProvider: "keycloak",
          trustHost: false,
          type: "authjs",
        },
        sessionRefresh: {
          enableOnWindowFocus: true,
          enablePeriodically: 15000,
          handler: "",
        },
      },
      origin: "https://fakenode.com/flame/api/auth",
      version: "0.2.2",
    },
  });

  afterEach(() => {
    // vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  async function avatarMenuChecks(authenticated: boolean) {
    const status = authenticated ? "authenticated" : "unauthenticated";
    const expectedIcon = authenticated ? "pi-user" : "pi-question";
    const logPrompt = authenticated ? "Logout" : "Login";
    const userData = authenticated ? { user: { name: testUser } } : {};

    vi.stubGlobal("useAuth", () => ({
      signIn: vi.fn(),
      signOut: vi.fn(),
      status: ref(status),
      data: ref(userData),
    }));

    const wrapper = mount(AvatarButton, {
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
        },
      },
    });
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

    const menu = wrapper.find(".avatar-menu");
    expect(menu.text()).toContain("Keycloak");
    expect(menu.text()).toContain(logPrompt);

    const keycloakBtn = menu
      .findAll("a")
      .find((e1) => e1.text() === "Keycloak Admin");
    if (keycloakBtn) {
      expect(keycloakBtn.attributes()["href"]).toBe(
        "https://fakenode.com/keycloak",
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
