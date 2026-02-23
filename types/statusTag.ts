import type { HintedString } from "@primevue/core";

export type TagSeverity =
  | HintedString<
      "secondary" | "success" | "info" | "warn" | "danger" | "contrast"
    >
  | undefined;
