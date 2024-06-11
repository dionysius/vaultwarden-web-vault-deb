import { GENERATOR_DISK, UserKeyDefinition } from "@bitwarden/common/platform/state";
import { BufferedKeyDefinition } from "@bitwarden/common/tools/state/buffered-key-definition";

import {
  PassphraseGenerationOptions,
  PasswordGenerationOptions,
  CatchallGenerationOptions,
  EffUsernameGenerationOptions,
  ApiOptions,
  EmailDomainOptions,
  EmailPrefixOptions,
  SelfHostedApiOptions,
  SubaddressGenerationOptions,
} from "../types";

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
