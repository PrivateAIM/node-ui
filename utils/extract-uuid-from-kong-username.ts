export function extractUuid(kongName: string) {
  const uuid = kongName.split("-");
  const dsType = uuid.pop();
  return [dsType, uuid.join("-")];
}
