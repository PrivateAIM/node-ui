export const useNodeType = () =>
  useState<string | null>("nodeType", () => null);
