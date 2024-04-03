import { RequestOptions } from "./options/forwarder-options";
import { UsernameGenerationMode } from "./options/generator-options";

/** Settings supported when generating an email subaddress */
export type CatchallGenerationOptions = {
  /** selects the generation algorithm for the catchall email address. */
  catchallType?: UsernameGenerationMode;

  /** The domain part of the generated email address.
   *  @example If the domain is `domain.io` and the generated username
   *  is `jd`, then the generated email address will be `jd@mydomain.io`
   */
  catchallDomain?: string;
} & RequestOptions;

/** The default options for catchall address generation. */
export const DefaultCatchallOptions: CatchallGenerationOptions = Object.freeze({
  catchallType: "random",
  catchallDomain: "",
  website: null,
});
