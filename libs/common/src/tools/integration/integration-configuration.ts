import { IntegrationContext } from "./integration-context";
import { IntegrationMetadata } from "./integration-metadata";
import { ApiSettings, TokenHeader } from "./rpc";

/** Configures integration-wide settings */
export type IntegrationConfiguration = IntegrationMetadata & {
  /** Creates the authentication header for all integration remote procedure calls */
  authenticate: (settings: ApiSettings, context: IntegrationContext) => TokenHeader;
};
