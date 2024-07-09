/** Options that provide contextual information about the application state
 *  when an integration is invoked.
 */
export type IntegrationRequest = {
  /** @param website The domain of the website the requested integration is used
   *  within. This should be set to `null` when the request is not specific
   *  to any website.
   *  @remarks this field contains sensitive data
   */
  website: string | null;
};
