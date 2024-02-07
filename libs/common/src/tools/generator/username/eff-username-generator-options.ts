/** Settings supported when generating an ASCII username */
export type EffUsernameGenerationOptions = {
  wordCapitalize?: boolean;
  wordIncludeNumber?: boolean;
};

/** The default options for EFF long word generation. */
export const DefaultEffUsernameOptions: Partial<EffUsernameGenerationOptions> = Object.freeze({
  wordCapitalize: false,
  wordIncludeNumber: false,
});
