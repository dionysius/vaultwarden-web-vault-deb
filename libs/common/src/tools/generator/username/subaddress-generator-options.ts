import { RequestOptions } from "./options/forwarder-options";
import { UsernameGenerationMode } from "./options/generator-options";

/** Settings supported when generating an email subaddress */
export type SubaddressGenerationOptions = {
  /** selects the generation algorithm for the catchall email address. */
  subaddressType?: UsernameGenerationMode;

  /** the email address the subaddress is applied to. */
  subaddressEmail?: string;
} & RequestOptions;

/** The default options for email subaddress generation. */
export const DefaultSubaddressOptions: SubaddressGenerationOptions = Object.freeze({
  subaddressType: "random",
  subaddressEmail: "",
  website: null,
});
