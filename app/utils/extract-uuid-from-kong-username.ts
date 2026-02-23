export function extractUuid(kongName: string): string[] {
  const uuid = kongName.split("-");
  const dsType = uuid.pop() as string;
  return [dsType, uuid.join("-")];
}
