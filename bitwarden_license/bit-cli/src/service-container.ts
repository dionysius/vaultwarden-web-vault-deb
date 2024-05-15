import { ServiceContainer as OssServiceContainer } from "@bitwarden/cli/service-container";

/**
 * Instantiates services and makes them available for dependency injection.
 * Any Bitwarden-licensed services should be registered here.
 */
export class ServiceContainer extends OssServiceContainer {}
