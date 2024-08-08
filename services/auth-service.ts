import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";

export default class AuthService {
  private userManager!: UserManager;
  private keycloakConfig;

  constructor() {
    const rtConfig = useRuntimeConfig();

    const keycloakInitOptions = {
      url: rtConfig.public.keycloakUrl as string,
      clientId: rtConfig.public.keycloakClientId as string,
      clientSecret: rtConfig.public.keycloakClientSecret,
    };

    this.keycloakConfig = {
      ...keycloakInitOptions,
    };
    this.initializedOidc();
  }

  private initializedOidc() {
    try {
      const { url, clientId, clientSecret } = this.keycloakConfig;
      const settings = {
        authority: url,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: "http://localhost:3000/auth/callback",
        silent_redirect_uri: `${window.location.origin}/auth/silent-refresh`,
        post_logout_redirect_uri: `${window.location.origin}`,
        response_type: "code",
        userStore: new WebStorageStateStore(),
        loadUserInfo: true,
      };
      this.userManager = new UserManager(settings);
    } catch (error) {
      console.error(error);
    }
  }

  public signInRedirect() {
    return this.userManager.signinRedirect();
  }

  public signInCallback() {
    return this.userManager.signinCallback();
  }

  public renewToken(): Promise<void> {
    return this.userManager.signinSilentCallback();
  }

  public logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }

  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }
}
