export function extractUuid(kongName: string) {
  const uuid = kongName.split("-");
  uuid.pop();
  return uuid.join("-");
}
