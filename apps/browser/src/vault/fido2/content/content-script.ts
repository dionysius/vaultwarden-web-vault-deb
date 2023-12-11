import {
  AssertCredentialParams,
  CreateCredentialParams,
} from "@bitwarden/common/vault/abstractions/fido2/fido2-client.service.abstraction";

import { Message, MessageType } from "./messaging/message";
import { Messenger } from "./messaging/messenger";

function isFido2FeatureEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { command: "checkFido2FeatureEnabled" },
      (response: { result?: boolean }) => resolve(response.result),
    );
  });
}

async function getFromLocalStorage(keys: string | string[]): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (storage: Record<string, any>) => resolve(storage));
  });
}

async function getActiveUserSettings() {
  // TODO: This is code copied from `notification-bar.tsx`. We should refactor this into a shared function.
  // Look up the active user id from storage
  const activeUserIdKey = "activeUserId";
  let activeUserId: string;

  const activeUserStorageValue = await getFromLocalStorage(activeUserIdKey);
  if (activeUserStorageValue[activeUserIdKey]) {
    activeUserId = activeUserStorageValue[activeUserIdKey];
  }

  const settingsStorage = await getFromLocalStorage(activeUserId);

  // Look up the user's settings from storage
  return settingsStorage?.[activeUserId]?.settings;
}

async function isDomainExcluded(activeUserSettings: Record<string, any>) {
  const excludedDomains = activeUserSettings?.neverDomains;
  return excludedDomains && window.location.hostname in excludedDomains;
}

async function hasActiveUser() {
  const activeUserIdKey = "activeUserId";
  const activeUserStorageValue = await getFromLocalStorage(activeUserIdKey);
  return activeUserStorageValue[activeUserIdKey] !== undefined;
}

function isSameOriginWithAncestors() {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
}

async function isLocationBitwardenVault(activeUserSettings: Record<string, any>) {
  return window.location.origin === activeUserSettings.serverConfig.environment.vault;
}

function initializeFido2ContentScript() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("content/fido2/page-script.js");
  (document.head || document.documentElement).appendChild(s);

  const messenger = Messenger.forDOMCommunication(window);

  messenger.handler = async (message, abortController) => {
    const requestId = Date.now().toString();
    const abortHandler = () =>
      chrome.runtime.sendMessage({
        command: "fido2AbortRequest",
        abortedRequestId: requestId,
      });
    abortController.signal.addEventListener("abort", abortHandler);

    if (message.type === MessageType.CredentialCreationRequest) {
      return new Promise((resolve, reject) => {
        const data: CreateCredentialParams = {
          ...message.data,
          origin: window.location.origin,
          sameOriginWithAncestors: isSameOriginWithAncestors(),
        };

        chrome.runtime.sendMessage(
          {
            command: "fido2RegisterCredentialRequest",
            data,
            requestId: requestId,
          },
          (response) => {
            if (response.error !== undefined) {
              return reject(response.error);
            }

            resolve({
              type: MessageType.CredentialCreationResponse,
              result: response.result,
            });
          },
        );
      });
    }

    if (message.type === MessageType.CredentialGetRequest) {
      return new Promise((resolve, reject) => {
        const data: AssertCredentialParams = {
          ...message.data,
          origin: window.location.origin,
          sameOriginWithAncestors: isSameOriginWithAncestors(),
        };

        chrome.runtime.sendMessage(
          {
            command: "fido2GetCredentialRequest",
            data,
            requestId: requestId,
          },
          (response) => {
            if (response.error !== undefined) {
              return reject(response.error);
            }

            resolve({
              type: MessageType.CredentialGetResponse,
              result: response.result,
            });
          },
        );
      }).finally(() =>
        abortController.signal.removeEventListener("abort", abortHandler),
      ) as Promise<Message>;
    }

    return undefined;
  };
}

async function run() {
  if (!(await hasActiveUser())) {
    return;
  }

  const activeUserSettings = await getActiveUserSettings();
  if (
    activeUserSettings == null ||
    !(await isFido2FeatureEnabled()) ||
    (await isDomainExcluded(activeUserSettings)) ||
    (await isLocationBitwardenVault(activeUserSettings))
  ) {
    return;
  }

  initializeFido2ContentScript();
}

run();
