import { RequestOptions } from "./options/forwarder-options";

/** Settings supported when generating a username using the EFF word list */
export type EffUsernameGenerationOptions = {
  /** when true, the word is capitalized */
  wordCapitalize?: boolean;

  /** when true, a random number is appended to the username */
  wordIncludeNumber?: boolean;
} & RequestOptions;

/** The default options for EFF long word generation. */
export const DefaultEffUsernameOptions: EffUsernameGenerationOptions = Object.freeze({
  wordCapitalize: false,
  wordIncludeNumber: false,
  website: null,
});
