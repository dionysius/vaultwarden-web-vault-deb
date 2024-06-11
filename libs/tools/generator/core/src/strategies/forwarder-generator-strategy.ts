import { map } from "rxjs";

import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import {
  SingleUserState,
  StateProvider,
  UserKeyDefinition,
} from "@bitwarden/common/platform/state";
import { BufferedKeyDefinition } from "@bitwarden/common/tools/state/buffered-key-definition";
import { BufferedState } from "@bitwarden/common/tools/state/buffered-state";
import { PaddedDataPacker } from "@bitwarden/common/tools/state/padded-data-packer";
import { SecretClassifier } from "@bitwarden/common/tools/state/secret-classifier";
import { SecretKeyDefinition } from "@bitwarden/common/tools/state/secret-key-definition";
import { SecretState } from "@bitwarden/common/tools/state/secret-state";
import { UserKeyEncryptor } from "@bitwarden/common/tools/state/user-key-encryptor";
import { UserId } from "@bitwarden/common/types/guid";

import { GeneratorStrategy } from "../abstractions";
import { newDefaultEvaluator } from "../rx";
import { ApiOptions, NoPolicy } from "../types";
import { clone$PerUserId, sharedByUserId } from "../util";

const OPTIONS_FRAME_SIZE = 512;

/** An email forwarding service configurable through an API. */
export abstract class ForwarderGeneratorStrategy<
  Options extends ApiOptions,
> extends GeneratorStrategy<Options, NoPolicy> {
  /** Initializes the generator strategy
   *  @param encryptService protects sensitive forwarder options
   *  @param keyService looks up the user key when protecting data.
   *  @param stateProvider creates the durable state for options storage
   */
  constructor(
    private readonly encryptService: EncryptService,
    private readonly keyService: CryptoService,
    private stateProvider: StateProvider,
    private readonly defaultOptions: Options,
  ) {
    super();
  }

  /** configures forwarder secret storage  */
  protected abstract readonly key: UserKeyDefinition<Options>;

  /** configures forwarder import buffer */
  protected abstract readonly rolloverKey: BufferedKeyDefinition<Options, Options>;

  // configuration
  readonly policy = PolicyType.PasswordGenerator;
  defaults$ = clone$PerUserId(this.defaultOptions);
  toEvaluator = newDefaultEvaluator<Options>();
  durableState = sharedByUserId((userId) => this.getUserSecrets(userId));

  // per-user encrypted state
  private getUserSecrets(userId: UserId): SingleUserState<Options> {
    // construct the encryptor
    const packer = new PaddedDataPacker(OPTIONS_FRAME_SIZE);
    const encryptor = new UserKeyEncryptor(this.encryptService, this.keyService, packer);

    // always exclude request properties
    const classifier = SecretClassifier.allSecret<Options>().exclude("website");

    // Derive the secret key definition
    const key = SecretKeyDefinition.value(this.key.stateDefinition, this.key.key, classifier, {
      deserializer: (d) => this.key.deserializer(d),
      cleanupDelayMs: this.key.cleanupDelayMs,
      clearOn: this.key.clearOn,
    });

    // the type parameter is explicit because type inference fails for `Omit<Options, "website">`
    const secretState = SecretState.from<
      Options,
      void,
      Options,
      Record<keyof Options, never>,
      Omit<Options, "website">
    >(userId, key, this.stateProvider, encryptor);

    // rollover should occur once the user key is available for decryption
    const canDecrypt$ = this.keyService
      .getInMemoryUserKeyFor$(userId)
      .pipe(map((key) => key !== null));
    const rolloverState = new BufferedState(
      this.stateProvider,
      this.rolloverKey,
      secretState,
      canDecrypt$,
    );

    return rolloverState;
  }
}
