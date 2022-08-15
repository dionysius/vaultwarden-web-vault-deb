import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { mock, MockProxy } from "jest-mock-extended";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { ProviderService } from "@bitwarden/common/abstractions/provider.service";
import { ProviderUserType } from "@bitwarden/common/enums/providerUserType";
import { Provider } from "@bitwarden/common/models/domain/provider";

import { ProviderPermissionsGuard } from "./provider-permissions.guard";

const providerFactory = (props: Partial<Provider> = {}) =>
  Object.assign(
    new Provider(),
    {
      id: "myProviderId",
      enabled: true,
      type: ProviderUserType.ServiceUser,
    },
    props
  );

describe("Provider Permissions Guard", () => {
  let router: MockProxy<Router>;
  let providerService: MockProxy<ProviderService>;
  let route: MockProxy<ActivatedRouteSnapshot>;

  let providerPermissionsGuard: ProviderPermissionsGuard;

  beforeEach(() => {
    router = mock<Router>();
    providerService = mock<ProviderService>();
    route = mock<ActivatedRouteSnapshot>({
      params: {
        providerId: providerFactory().id,
      },
      data: {
        providerPermissions: null,
      },
    });

    providerPermissionsGuard = new ProviderPermissionsGuard(
      providerService,
      router,
      mock<PlatformUtilsService>(),
      mock<I18nService>()
    );
  });

  it("blocks navigation if provider does not exist", async () => {
    providerService.get.mockResolvedValue(null);

    const actual = await providerPermissionsGuard.canActivate(route);

    expect(actual).not.toBe(true);
  });

  it("permits navigation if no permissions are specified", async () => {
    const provider = providerFactory();
    providerService.get.calledWith(provider.id).mockResolvedValue(provider);

    const actual = await providerPermissionsGuard.canActivate(route);

    expect(actual).toBe(true);
  });

  it("permits navigation if the user has permissions", async () => {
    const permissionsCallback = jest.fn();
    permissionsCallback.mockImplementation((provider) => true);
    route.data = {
      providerPermissions: permissionsCallback,
    };

    const provider = providerFactory();
    providerService.get.calledWith(provider.id).mockResolvedValue(provider);

    const actual = await providerPermissionsGuard.canActivate(route);

    expect(permissionsCallback).toHaveBeenCalled();
    expect(actual).toBe(true);
  });

  it("blocks navigation if the user does not have permissions", async () => {
    const permissionsCallback = jest.fn();
    permissionsCallback.mockImplementation((org) => false);
    route.data = {
      providerPermissions: permissionsCallback,
    };

    const provider = providerFactory();
    providerService.get.calledWith(provider.id).mockResolvedValue(provider);

    const actual = await providerPermissionsGuard.canActivate(route);

    expect(permissionsCallback).toHaveBeenCalled();
    expect(actual).not.toBe(true);
  });

  describe("given a disabled organization", () => {
    it("blocks navigation if user is not an admin", async () => {
      const org = providerFactory({
        type: ProviderUserType.ServiceUser,
        enabled: false,
      });
      providerService.get.calledWith(org.id).mockResolvedValue(org);

      const actual = await providerPermissionsGuard.canActivate(route);

      expect(actual).not.toBe(true);
    });

    it("permits navigation if user is an admin", async () => {
      const org = providerFactory({
        type: ProviderUserType.ProviderAdmin,
        enabled: false,
      });
      providerService.get.calledWith(org.id).mockResolvedValue(org);

      const actual = await providerPermissionsGuard.canActivate(route);

      expect(actual).toBe(true);
    });
  });
});
