import { EncryptService } from "../../../../platform/abstractions/encrypt.service";
import { SymmetricCryptoKey } from "../../../../platform/models/domain/symmetric-crypto-key";

import { DefaultOptions, Forwarders, SecretPadding } from "./constants";
import { ApiOptions, ForwarderId } from "./forwarder-options";
import { MaybeLeakedOptions, UsernameGeneratorOptions } from "./generator-options";

/** runs the callback on each forwarder configuration */
export function forAllForwarders<T>(
  options: UsernameGeneratorOptions,
  callback: (options: ApiOptions, id: ForwarderId) => T,
) {
  const results = [];
  for (const forwarder of Object.values(Forwarders).map((f) => f.id)) {
    const forwarderOptions = getForwarderOptions(forwarder, options);
    if (forwarderOptions) {
      results.push(callback(forwarderOptions, forwarder));
    }
  }
  return results;
}

/** Gets the options for the specified forwarding service with defaults applied.
 *  This method mutates `options`.
 * @param service Identifies the service whose options should be loaded.
 * @param options The options to load from.
 * @returns A reference to the options for the specified service.
 */
export function getForwarderOptions(
  service: string,
  options: UsernameGeneratorOptions,
): ApiOptions & MaybeLeakedOptions {
  if (service === Forwarders.AddyIo.id) {
    return falsyDefault(options.forwarders.addyIo, DefaultOptions.forwarders.addyIo);
  } else if (service === Forwarders.DuckDuckGo.id) {
    return falsyDefault(options.forwarders.duckDuckGo, DefaultOptions.forwarders.duckDuckGo);
  } else if (service === Forwarders.Fastmail.id) {
    return falsyDefault(options.forwarders.fastMail, DefaultOptions.forwarders.fastMail);
  } else if (service === Forwarders.FirefoxRelay.id) {
    return falsyDefault(options.forwarders.firefoxRelay, DefaultOptions.forwarders.firefoxRelay);
  } else if (service === Forwarders.ForwardEmail.id) {
    return falsyDefault(options.forwarders.forwardEmail, DefaultOptions.forwarders.forwardEmail);
  } else if (service === Forwarders.SimpleLogin.id) {
    return falsyDefault(options.forwarders.simpleLogin, DefaultOptions.forwarders.simpleLogin);
  } else {
    return null;
  }
}

/**
 * Recursively applies default values from `defaults` to falsy or
 * missing properties in  `value`.
 *
 * @remarks This method is not aware of the
 * object's prototype or metadata, such as readonly or frozen fields.
 * It should only be used on plain objects.
 *
 * @param value - The value to fill in. This parameter is mutated.
 * @param defaults - The default values to use.
 * @returns the mutated `value`.
 */
export function falsyDefault<T>(value: T, defaults: Partial<T>): T {
  // iterate keys in defaults because `value` may be missing keys
  for (const key in defaults) {
    if (defaults[key] instanceof Object) {
      // `any` type is required because typescript can't predict the type of `value[key]`.
      const target: any = value[key] || (defaults[key] instanceof Array ? [] : {});
      value[key] = falsyDefault(target, defaults[key]);
    } else if (!value[key]) {
      value[key] = defaults[key];
    }
  }

  return value;
}

/** encrypts sensitive options and stores them in-place.
 *  @param encryptService The service used to encrypt the options.
 *  @param key The key used to encrypt the options.
 *  @param options The options to encrypt. The encrypted members are
 *                 removed from the options and the decrypted members
 *                 are added to the options.
 */
export async function encryptInPlace(
  encryptService: EncryptService,
  key: SymmetricCryptoKey,
  options: ApiOptions & MaybeLeakedOptions,
) {
  if (!options.token) {
    return;
  }

  // pick the options that require encryption
  const encryptOptions = (({ token, wasPlainText }) => ({ token, wasPlainText }))(options);
  delete options.token;
  delete options.wasPlainText;

  // don't leak whether a leak was possible by padding the encrypted string.
  // without this, it could be possible to determine whether the token was
  // encrypted by checking the length of the encrypted string.
  const toEncrypt = JSON.stringify(encryptOptions).padEnd(
    SecretPadding.length,
    SecretPadding.character,
  );

  const encrypted = await encryptService.encrypt(toEncrypt, key);
  options.encryptedToken = encrypted;
}

/** decrypts sensitive options and stores them in-place.
 *  @param encryptService The service used to decrypt the options.
 *  @param key The key used to decrypt the options.
 *  @param options The options to decrypt. The encrypted members are
 *                 removed from the options and the decrypted members
 *                 are added to the options.
 *  @returns null if the options were decrypted successfully, otherwise
 *           a string describing why the options could not be decrypted.
 *           The return values are intended to be used for logging and debugging.
 *  @remarks This method does not throw if the options could not be decrypted
 *           because in such cases there's nothing the user can do to fix it.
 */
export async function decryptInPlace(
  encryptService: EncryptService,
  key: SymmetricCryptoKey,
  options: ApiOptions & MaybeLeakedOptions,
) {
  if (!options.encryptedToken) {
    return "missing encryptedToken";
  }

  const decrypted = await encryptService.decryptToUtf8(options.encryptedToken, key);
  delete options.encryptedToken;

  // If the decrypted string is not exactly the padding length, it could be compromised
  // and shouldn't be trusted.
  if (decrypted.length !== SecretPadding.length) {
    return "invalid length";
  }

  // JSON terminates with a closing brace, after which the plaintext repeats `character`
  // If the closing brace is not found, then it could be compromised and shouldn't be trusted.
  const jsonBreakpoint = decrypted.lastIndexOf("}") + 1;
  if (jsonBreakpoint < 1) {
    return "missing json object";
  }

  // If the padding contains invalid padding characters then the padding could be used
  // as a side channel for arbitrary data.
  if (decrypted.substring(jsonBreakpoint).match(SecretPadding.hasInvalidPadding)) {
    return "invalid padding";
  }

  // remove padding and parse the JSON
  const json = decrypted.substring(0, jsonBreakpoint);

  const { decryptedOptions, error } = parseOptions(json);
  if (error) {
    return error;
  }

  Object.assign(options, decryptedOptions);
}

function parseOptions(json: string) {
  let decryptedOptions = null;
  try {
    decryptedOptions = JSON.parse(json);
  } catch {
    return { decryptedOptions: undefined as string, error: "invalid json" };
  }

  // If the decrypted options contain any property that is not in the original
  // options, then the object could be used as a side channel for arbitrary data.
  if (Object.keys(decryptedOptions).some((key) => key !== "token" && key !== "wasPlainText")) {
    return { decryptedOptions: undefined as string, error: "unknown keys" };
  }

  // If the decrypted properties are not the expected type, then the object could
  // be compromised and shouldn't be trusted.
  if (typeof decryptedOptions.token !== "string") {
    return { decryptedOptions: undefined as string, error: "invalid token" };
  }
  if (decryptedOptions.wasPlainText !== undefined && decryptedOptions.wasPlainText !== true) {
    return { decryptedOptions: undefined as string, error: "invalid wasPlainText" };
  }

  return { decryptedOptions, error: undefined as string };
}
