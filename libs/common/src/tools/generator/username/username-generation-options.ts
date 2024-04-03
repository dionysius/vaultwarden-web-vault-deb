import { CatchallGenerationOptions } from "./catchall-generator-options";
import { EffUsernameGenerationOptions } from "./eff-username-generator-options";
import { ForwarderId, RequestOptions } from "./options/forwarder-options";
import { UsernameGeneratorType } from "./options/generator-options";
import { SubaddressGenerationOptions } from "./subaddress-generator-options";

export type UsernameGeneratorOptions = EffUsernameGenerationOptions &
  SubaddressGenerationOptions &
  CatchallGenerationOptions &
  RequestOptions & {
    type?: UsernameGeneratorType;
    forwardedService?: ForwarderId | "";
    forwardedAnonAddyApiToken?: string;
    forwardedAnonAddyDomain?: string;
    forwardedAnonAddyBaseUrl?: string;
    forwardedDuckDuckGoToken?: string;
    forwardedFirefoxApiToken?: string;
    forwardedFastmailApiToken?: string;
    forwardedForwardEmailApiToken?: string;
    forwardedForwardEmailDomain?: string;
    forwardedSimpleLoginApiKey?: string;
    forwardedSimpleLoginBaseUrl?: string;
  };
