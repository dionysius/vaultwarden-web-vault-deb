import { Jsonify } from "type-fest";

import { GENERATOR_DISK, UserKeyDefinition } from "../../platform/state";
import { BufferedKeyDefinition } from "../state/buffered-key-definition";
import { SecretClassifier } from "../state/secret-classifier";
import { SecretKeyDefinition } from "../state/secret-key-definition";

import { GeneratedCredential } from "./history/generated-credential";
import { LegacyPasswordHistoryDecryptor } from "./history/legacy-password-history-decryptor";
import { GeneratorNavigation } from "./navigation/generator-navigation";
import { PassphraseGenerationOptions } from "./passphrase/passphrase-generation-options";
import { GeneratedPasswordHistory } from "./password/generated-password-history";
import { PasswordGenerationOptions } from "./password/password-generation-options";
import { CatchallGenerationOptions } from "./username/catchall-generator-options";
import { EffUsernameGenerationOptions } from "./username/eff-username-generator-options";
import {
  ApiOptions,
  EmailDomainOptions,
  EmailPrefixOptions,
  SelfHostedApiOptions,
} from "./username/options/forwarder-options";
import { SubaddressGenerationOptions } from "./username/subaddress-generator-options";

/** plaintext password generation options */
export const GENERATOR_SETTINGS = new UserKeyDefinition<GeneratorNavigation>(
  GENERATOR_DISK,
  "generatorSettings",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** plaintext password generation options */
export const PASSWORD_SETTINGS = new UserKeyDefinition<PasswordGenerationOptions>(
  GENERATOR_DISK,
  "passwordGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext passphrase generation options */
export const PASSPHRASE_SETTINGS = new UserKeyDefinition<PassphraseGenerationOptions>(
  GENERATOR_DISK,
  "passphraseGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext username generation options */
export const EFF_USERNAME_SETTINGS = new UserKeyDefinition<EffUsernameGenerationOptions>(
  GENERATOR_DISK,
  "effUsernameGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext configuration for a domain catch-all address. */
export const CATCHALL_SETTINGS = new UserKeyDefinition<CatchallGenerationOptions>(
  GENERATOR_DISK,
  "catchallGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext configuration for an email subaddress. */
export const SUBADDRESS_SETTINGS = new UserKeyDefinition<SubaddressGenerationOptions>(
  GENERATOR_DISK,
  "subaddressGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link Forwarders.AddyIo} */
export const ADDY_IO_FORWARDER = new UserKeyDefinition<SelfHostedApiOptions & EmailDomainOptions>(
  GENERATOR_DISK,
  "addyIoForwarder",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link Forwarders.DuckDuckGo} */
export const DUCK_DUCK_GO_FORWARDER = new UserKeyDefinition<ApiOptions>(
  GENERATOR_DISK,
  "duckDuckGoForwarder",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link Forwarders.FastMail} */
export const FASTMAIL_FORWARDER = new UserKeyDefinition<ApiOptions & EmailPrefixOptions>(
  GENERATOR_DISK,
  "fastmailForwarder",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link Forwarders.FireFoxRelay} */
export const FIREFOX_RELAY_FORWARDER = new UserKeyDefinition<ApiOptions>(
  GENERATOR_DISK,
  "firefoxRelayForwarder",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link Forwarders.ForwardEmail} */
export const FORWARD_EMAIL_FORWARDER = new UserKeyDefinition<ApiOptions & EmailDomainOptions>(
  GENERATOR_DISK,
  "forwardEmailForwarder",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link forwarders.SimpleLogin} */
export const SIMPLE_LOGIN_FORWARDER = new UserKeyDefinition<SelfHostedApiOptions>(
  GENERATOR_DISK,
  "simpleLoginForwarder",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** backing store configuration for {@link Forwarders.AddyIo} */
export const ADDY_IO_BUFFER = new BufferedKeyDefinition<SelfHostedApiOptions & EmailDomainOptions>(
  GENERATOR_DISK,
  "addyIoBuffer",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** backing store configuration for {@link Forwarders.DuckDuckGo} */
export const DUCK_DUCK_GO_BUFFER = new BufferedKeyDefinition<ApiOptions>(
  GENERATOR_DISK,
  "duckDuckGoBuffer",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** backing store configuration for {@link Forwarders.FastMail} */
export const FASTMAIL_BUFFER = new BufferedKeyDefinition<ApiOptions & EmailPrefixOptions>(
  GENERATOR_DISK,
  "fastmailBuffer",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** backing store configuration for {@link Forwarders.FireFoxRelay} */
export const FIREFOX_RELAY_BUFFER = new BufferedKeyDefinition<ApiOptions>(
  GENERATOR_DISK,
  "firefoxRelayBuffer",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** backing store configuration for {@link Forwarders.ForwardEmail} */
export const FORWARD_EMAIL_BUFFER = new BufferedKeyDefinition<ApiOptions & EmailDomainOptions>(
  GENERATOR_DISK,
  "forwardEmailBuffer",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** backing store configuration for {@link forwarders.SimpleLogin} */
export const SIMPLE_LOGIN_BUFFER = new BufferedKeyDefinition<SelfHostedApiOptions>(
  GENERATOR_DISK,
  "simpleLoginBuffer",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** encrypted password generation history */
export const GENERATOR_HISTORY = SecretKeyDefinition.array(
  GENERATOR_DISK,
  "localGeneratorHistory",
  SecretClassifier.allSecret<GeneratedCredential>(),
  {
    deserializer: GeneratedCredential.fromJSON,
    clearOn: ["logout"],
  },
);

/** encrypted password generation history subject to migration */
export const GENERATOR_HISTORY_BUFFER = new BufferedKeyDefinition<
  GeneratedPasswordHistory[],
  GeneratedCredential[],
  LegacyPasswordHistoryDecryptor
>(GENERATOR_DISK, "localGeneratorHistoryBuffer", {
  deserializer(history) {
    const items = history as Jsonify<GeneratedPasswordHistory>[];
    return items?.map((h) => new GeneratedPasswordHistory(h.password, h.date));
  },
  async isValid(history) {
    return history.length ? true : false;
  },
  async map(history, decryptor) {
    const credentials = await decryptor.decrypt(history);
    const mapped = credentials.map((c) => new GeneratedCredential(c.password, "password", c.date));
    return mapped;
  },
  clearOn: ["logout"],
});
