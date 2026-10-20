export enum HelpTextField {
  Methods = "methods",
  FHIR = "FHIR",
  S3 = "S3",
  Port = "port",
  Protocol = "protocol",
  Server = "server",
  Type = "type",
}

export interface AvailableProject {
  name: string | undefined | null;
  id: string;
}
