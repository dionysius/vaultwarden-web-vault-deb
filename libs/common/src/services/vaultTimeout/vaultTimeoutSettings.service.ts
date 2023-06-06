import { VaultTimeoutSettingsService as VaultTimeoutSettingsServiceAbstraction } from "../../abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { PolicyType } from "../../admin-console/enums";
import { TokenService } from "../../auth/abstractions/token.service";
import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { StateService } from "../../platform/abstractions/state.service";

export class VaultTimeoutSettingsService implements VaultTimeoutSettingsServiceAbstraction {
  constructor(
    private cryptoService: CryptoService,
    private tokenService: TokenService,
    private policyService: PolicyService,
    private stateService: StateService
  ) {}

  async setVaultTimeoutOptions(timeout: number, action: VaultTimeoutAction): Promise<void> {
    await this.stateService.setVaultTimeout(timeout);

    // We swap these tokens from being on disk for lock actions, and in memory for logout actions
    // Get them here to set them to their new location after changing the timeout action and clearing if needed
    const token = await this.tokenService.getToken();
    const refreshToken = await this.tokenService.getRefreshToken();
    const clientId = await this.tokenService.getClientId();
    const clientSecret = await this.tokenService.getClientSecret();

    const currentAction = await this.stateService.getVaultTimeoutAction();
    if (
      (timeout != null || timeout === 0) &&
      action === VaultTimeoutAction.LogOut &&
      action !== currentAction
    ) {
      // if we have a vault timeout and the action is log out, reset tokens
      await this.tokenService.clearToken();
    }

    await this.stateService.setVaultTimeoutAction(action);

    await this.tokenService.setToken(token);
    await this.tokenService.setRefreshToken(refreshToken);
    await this.tokenService.setClientId(clientId);
    await this.tokenService.setClientSecret(clientSecret);

    await this.cryptoService.toggleKey();
  }

  async isPinLockSet(): Promise<[boolean, boolean]> {
    const protectedPin = await this.stateService.getProtectedPin();
    const pinProtectedKey = await this.stateService.getEncryptedPinProtected();
    return [protectedPin != null, pinProtectedKey != null];
  }

  async isBiometricLockSet(): Promise<boolean> {
    return await this.stateService.getBiometricUnlock();
  }

  async getVaultTimeout(userId?: string): Promise<number> {
    const vaultTimeout = await this.stateService.getVaultTimeout({ userId: userId });

    if (
      await this.policyService.policyAppliesToUser(PolicyType.MaximumVaultTimeout, null, userId)
    ) {
      const policy = await this.policyService.getAll(PolicyType.MaximumVaultTimeout, userId);
      // Remove negative values, and ensure it's smaller than maximum allowed value according to policy
      let timeout = Math.min(vaultTimeout, policy[0].data.minutes);

      if (vaultTimeout == null || timeout < 0) {
        timeout = policy[0].data.minutes;
      }

      // We really shouldn't need to set the value here, but multiple services relies on this value being correct.
      if (vaultTimeout !== timeout) {
        await this.stateService.setVaultTimeout(timeout, { userId: userId });
      }

      return timeout;
    }

    return vaultTimeout;
  }

  async getVaultTimeoutAction(userId?: string): Promise<VaultTimeoutAction> {
    let vaultTimeoutAction = await this.stateService.getVaultTimeoutAction({ userId: userId });

    if (
      await this.policyService.policyAppliesToUser(PolicyType.MaximumVaultTimeout, null, userId)
    ) {
      const policy = await this.policyService.getAll(PolicyType.MaximumVaultTimeout, userId);
      const action = policy[0].data.action;

      if (action) {
        // We really shouldn't need to set the value here, but multiple services relies on this value being correct.
        if (action && vaultTimeoutAction !== action) {
          await this.stateService.setVaultTimeoutAction(action, { userId: userId });
        }
        vaultTimeoutAction = action;
      }
    }

    return vaultTimeoutAction === VaultTimeoutAction.LogOut
      ? VaultTimeoutAction.LogOut
      : VaultTimeoutAction.Lock;
  }

  async clear(userId?: string): Promise<void> {
    await this.stateService.setEverBeenUnlocked(false, { userId: userId });
    await this.stateService.setDecryptedPinProtected(null, { userId: userId });
    await this.stateService.setProtectedPin(null, { userId: userId });
  }
}
