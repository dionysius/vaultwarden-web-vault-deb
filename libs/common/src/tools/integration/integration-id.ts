import { Opaque } from "type-fest";

/** Identifies a vendor integrated into bitwarden */
export type IntegrationId = Opaque<
  "anonaddy" | "duckduckgo" | "fastmail" | "firefoxrelay" | "forwardemail" | "simplelogin",
  "IntegrationId"
>;
