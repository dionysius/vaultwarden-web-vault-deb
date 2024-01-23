import {
  ApiOptions,
  EmailDomainOptions,
  EmailPrefixOptions,
  ForwarderId,
  SelfHostedApiOptions,
} from "./forwarder-options";

/** Configuration for username generation algorithms. */
export type AlgorithmOptions = {
  /** selects the generation algorithm for the username.
   *  "random" generates a random string.
   *  "website-name" generates a username based on the website's name.
   */
  algorithm: "random" | "website-name";
};

/** Identifies encrypted options that could have leaked from the configuration. */
export type MaybeLeakedOptions = {
  /** When true, encrypted options were previously stored as plaintext.
   *  @remarks This is used to alert the user that the token should be
   *           regenerated. If a token has always been stored encrypted,
   *           this should be omitted.
   */
  wasPlainText?: true;
};

/** Options for generating a username.
 * @remarks This type includes all fields so that the generator
 * remembers the user's configuration for each type of username
 * and forwarder.
 */
export type UsernameGeneratorOptions = {
  /** selects the property group used for username generation */
  type?: "word" | "subaddress" | "catchall" | "forwarded";

  /** When generating a forwarding address for a vault item, this should contain
   *  the domain the vault item supplies to the generator.
   *  @example If the user is creating a vault item for `https://www.domain.io/login`,
   *  then this should be `www.domain.io`.
   */
  website?: string;

  /** When true, the username generator saves options immediately
   * after they're loaded. Otherwise this option should not be defined.
   * */
  saveOnLoad?: true;

  /* Configures generation of a username from the EFF word list */
  word: {
    /** when true, the word is capitalized */
    capitalize?: boolean;

    /** when true, a random number is appended to the username */
    includeNumber?: boolean;
  };

  /** Configures generation of an email subaddress.
   *  @remarks The subaddress is the part following the `+`.
   *  For example, if the email address is `jd+xyz@domain.io`,
   *  the subaddress is `xyz`.
   */
  subaddress: AlgorithmOptions & {
    /** the email address the subaddress is applied to. */
    email?: string;
  };

  /** Configures generation for a domain catch-all address.
   */
  catchall: AlgorithmOptions & EmailDomainOptions;

  /** Configures generation for an email forwarding service address.
   */
  forwarders: {
    /** The service to use for email forwarding.
     *  @remarks This determines which forwarder-specific options to use.
     */
    service?: ForwarderId;

    /** {@link Forwarders.AddyIo} */
    addyIo: SelfHostedApiOptions & EmailDomainOptions & MaybeLeakedOptions;

    /** {@link Forwarders.DuckDuckGo} */
    duckDuckGo: ApiOptions & MaybeLeakedOptions;

    /** {@link Forwarders.FastMail} */
    fastMail: ApiOptions & EmailPrefixOptions & MaybeLeakedOptions;

    /** {@link Forwarders.FireFoxRelay} */
    firefoxRelay: ApiOptions & MaybeLeakedOptions;

    /** {@link Forwarders.ForwardEmail} */
    forwardEmail: ApiOptions & EmailDomainOptions & MaybeLeakedOptions;

    /** {@link forwarders.SimpleLogin} */
    simpleLogin: SelfHostedApiOptions & MaybeLeakedOptions;
  };
};
