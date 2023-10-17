import { FallbackRequestedError } from "@bitwarden/common/vault/abstractions/fido2/fido2-client.service.abstraction";

import { WebauthnUtils } from "../webauthn-utils";

import { MessageType } from "./messaging/message";
import { Messenger } from "./messaging/messenger";

const BrowserPublicKeyCredential = window.PublicKeyCredential;

const browserNativeWebauthnSupport = window.PublicKeyCredential != undefined;
let browserNativeWebauthnPlatformAuthenticatorSupport = false;
if (!browserNativeWebauthnSupport) {
  // Polyfill webauthn support
  try {
    // credentials is read-only if supported, use type-casting to force assignment
    (navigator as any).credentials = {
      async create() {
        throw new Error("Webauthn not supported in this browser.");
      },
      async get() {
        throw new Error("Webauthn not supported in this browser.");
      },
    };
    window.PublicKeyCredential = class PolyfillPublicKeyCredential {
      static isUserVerifyingPlatformAuthenticatorAvailable() {
        return Promise.resolve(true);
      }
    } as any;
    window.AuthenticatorAttestationResponse =
      class PolyfillAuthenticatorAttestationResponse {} as any;
  } catch {
    /* empty */
  }
}

if (browserNativeWebauthnSupport) {
  BrowserPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then((available) => {
    browserNativeWebauthnPlatformAuthenticatorSupport = available;

    if (!available) {
      // Polyfill platform authenticator support
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = () =>
        Promise.resolve(true);
    }
  });
}

const browserCredentials = {
  create: navigator.credentials.create.bind(
    navigator.credentials
  ) as typeof navigator.credentials.create,
  get: navigator.credentials.get.bind(navigator.credentials) as typeof navigator.credentials.get,
};

const messenger = Messenger.forDOMCommunication(window);

function isSameOriginWithAncestors() {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
}

navigator.credentials.create = async (
  options?: CredentialCreationOptions,
  abortController?: AbortController
): Promise<Credential> => {
  const fallbackSupported =
    (options?.publicKey?.authenticatorSelection.authenticatorAttachment === "platform" &&
      browserNativeWebauthnPlatformAuthenticatorSupport) ||
    (options?.publicKey?.authenticatorSelection.authenticatorAttachment !== "platform" &&
      browserNativeWebauthnSupport);
  try {
    const isNotIframe = isSameOriginWithAncestors();

    const response = await messenger.request(
      {
        type: MessageType.CredentialCreationRequest,
        data: WebauthnUtils.mapCredentialCreationOptions(
          options,
          window.location.origin,
          isNotIframe,
          fallbackSupported
        ),
      },
      abortController
    );

    if (response.type !== MessageType.CredentialCreationResponse) {
      throw new Error("Something went wrong.");
    }

    return WebauthnUtils.mapCredentialRegistrationResult(response.result);
  } catch (error) {
    if (error && error.fallbackRequested && fallbackSupported) {
      return await browserCredentials.create(options);
    }

    throw error;
  }
};

navigator.credentials.get = async (
  options?: CredentialRequestOptions,
  abortController?: AbortController
): Promise<Credential> => {
  const fallbackSupported = browserNativeWebauthnSupport;

  try {
    if (options?.mediation && options.mediation !== "optional") {
      throw new FallbackRequestedError();
    }

    const response = await messenger.request(
      {
        type: MessageType.CredentialGetRequest,
        data: WebauthnUtils.mapCredentialRequestOptions(
          options,
          window.location.origin,
          true,
          fallbackSupported
        ),
      },
      abortController
    );

    if (response.type !== MessageType.CredentialGetResponse) {
      throw new Error("Something went wrong.");
    }

    return WebauthnUtils.mapCredentialAssertResult(response.result);
  } catch (error) {
    if (error && error.fallbackRequested && fallbackSupported) {
      return await browserCredentials.get(options);
    }

    throw error;
  }
};
