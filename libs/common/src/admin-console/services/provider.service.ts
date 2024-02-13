import { StateService } from "../../platform/abstractions/state.service";
import { KeyDefinition, PROVIDERS_DISK } from "../../platform/state";
import { ProviderService as ProviderServiceAbstraction } from "../abstractions/provider.service";
import { ProviderData } from "../models/data/provider.data";
import { Provider } from "../models/domain/provider";

export const PROVIDERS = KeyDefinition.record<ProviderData>(PROVIDERS_DISK, "providers", {
  deserializer: (obj: ProviderData) => obj,
});

export class ProviderService implements ProviderServiceAbstraction {
  constructor(private stateService: StateService) {}

  async get(id: string): Promise<Provider> {
    const providers = await this.stateService.getProviders();
    // eslint-disable-next-line
    if (providers == null || !providers.hasOwnProperty(id)) {
      return null;
    }

    return new Provider(providers[id]);
  }

  async getAll(): Promise<Provider[]> {
    const providers = await this.stateService.getProviders();
    const response: Provider[] = [];
    for (const id in providers) {
      // eslint-disable-next-line
      if (providers.hasOwnProperty(id)) {
        response.push(new Provider(providers[id]));
      }
    }
    return response;
  }

  async save(providers: { [id: string]: ProviderData }) {
    await this.stateService.setProviders(providers);
  }
}
