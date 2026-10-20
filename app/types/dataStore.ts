import type { modifiedTimestamp } from "~/services/modifiedApiInterfaces";

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

export interface DetailedDataStoreTableRow {
  rowKey: string;
  datastoreId?: string | undefined;
  projectId?: string | undefined;
  name?: string | null | undefined;
  type?: string | undefined;
  project?: string | undefined;
  path?: string | null | undefined;
  host?: string | null | undefined;
  port?: number | null | undefined;
  protocol?: string | null | undefined;
  created_at?: modifiedTimestamp | undefined;
  updated_at?: modifiedTimestamp | undefined;
}
