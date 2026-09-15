// next-auth module definitions
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      name: string;
      email: string;
    };
    accessToken?: string;
    expires?: Date;
    expiresAt?: number;
    error?: string;
  }
}
