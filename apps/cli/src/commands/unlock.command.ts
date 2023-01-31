import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { KeyConnectorService } from "@bitwarden/common/abstractions/keyConnector.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { HashPurpose } from "@bitwarden/common/enums/hashPurpose";
import { Utils } from "@bitwarden/common/misc/utils";
import { SecretVerificationRequest } from "@bitwarden/common/models/request/secret-verification.request";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { Response } from "../models/response";
import { MessageResponse } from "../models/response/message.response";
import { CliUtils } from "../utils";

import { ConvertToKeyConnectorCommand } from "./convert-to-key-connector.command";

export class UnlockCommand {
  constructor(
    private cryptoService: CryptoService,
    private stateService: StateService,
    private cryptoFunctionService: CryptoFunctionService,
    private apiService: ApiService,
    private logService: ConsoleLogService,
    private keyConnectorService: KeyConnectorService,
    private environmentService: EnvironmentService,
    private syncService: SyncService,
    private organizationApiService: OrganizationApiServiceAbstraction,
    private logout: () => Promise<void>
  ) {}

  async run(password: string, cmdOptions: Record<string, any>) {
    const normalizedOptions = new Options(cmdOptions);
    const passwordResult = await CliUtils.getPassword(password, normalizedOptions, this.logService);

    if (passwordResult instanceof Response) {
      return passwordResult;
    } else {
      password = passwordResult;
    }

    await this.setNewSessionKey();
    const email = await this.stateService.getEmail();
    const kdf = await this.stateService.getKdfType();
    const kdfConfig = await this.stateService.getKdfConfig();
    const key = await this.cryptoService.makeKey(password, email, kdf, kdfConfig);
    const storedKeyHash = await this.cryptoService.getKeyHash();

    let passwordValid = false;
    if (key != null) {
      if (storedKeyHash != null) {
        passwordValid = await this.cryptoService.compareAndUpdateKeyHash(password, key);
      } else {
        const serverKeyHash = await this.cryptoService.hashPassword(
          password,
          key,
          HashPurpose.ServerAuthorization
        );
        const request = new SecretVerificationRequest();
        request.masterPasswordHash = serverKeyHash;
        try {
          await this.apiService.postAccountVerifyPassword(request);
          passwordValid = true;
          const localKeyHash = await this.cryptoService.hashPassword(
            password,
            key,
            HashPurpose.LocalAuthorization
          );
          await this.cryptoService.setKeyHash(localKeyHash);
        } catch {
          // Ignore
        }
      }
    }

    if (passwordValid) {
      await this.cryptoService.setKey(key);

      if (await this.keyConnectorService.getConvertAccountRequired()) {
        const convertToKeyConnectorCommand = new ConvertToKeyConnectorCommand(
          this.keyConnectorService,
          this.environmentService,
          this.syncService,
          this.organizationApiService,
          this.logout
        );
        const convertResponse = await convertToKeyConnectorCommand.run();
        if (!convertResponse.success) {
          return convertResponse;
        }
      }

      return this.successResponse();
    } else {
      return Response.error("Invalid master password.");
    }
  }

  private async setNewSessionKey() {
    const key = await this.cryptoFunctionService.randomBytes(64);
    process.env.BW_SESSION = Utils.fromBufferToB64(key);
  }

  private async successResponse() {
    const res = new MessageResponse(
      "Your vault is now unlocked!",
      "\n" +
        "To unlock your vault, set your session key to the `BW_SESSION` environment variable. ex:\n" +
        '$ export BW_SESSION="' +
        process.env.BW_SESSION +
        '"\n' +
        '> $env:BW_SESSION="' +
        process.env.BW_SESSION +
        '"\n\n' +
        "You can also pass the session key to any command with the `--session` option. ex:\n" +
        "$ bw list items --session " +
        process.env.BW_SESSION
    );
    res.raw = process.env.BW_SESSION;
    return Response.success(res);
  }
}

class Options {
  passwordEnv: string;
  passwordFile: string;

  constructor(passedOptions: Record<string, any>) {
    this.passwordEnv = passedOptions?.passwordenv || passedOptions?.passwordEnv;
    this.passwordFile = passedOptions?.passwordfile || passedOptions?.passwordFile;
  }
}
