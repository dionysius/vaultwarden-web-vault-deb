import { Message, MessageType } from "./messaging/message";
import { Messenger } from "./messaging/messenger";

function checkFido2FeatureEnabled() {
  chrome.runtime.sendMessage(
    { command: "checkFido2FeatureEnabled" },
    (response: { result?: boolean }) => initializeFido2ContentScript(response.result)
  );
}

function initializeFido2ContentScript(isFido2FeatureEnabled: boolean) {
  if (isFido2FeatureEnabled !== true) {
    return;
  }

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
        chrome.runtime.sendMessage(
          {
            command: "fido2RegisterCredentialRequest",
            data: message.data,
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
          }
        );
      });
    }

    if (message.type === MessageType.CredentialGetRequest) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            command: "fido2GetCredentialRequest",
            data: message.data,
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
          }
        );
      }).finally(() =>
        abortController.signal.removeEventListener("abort", abortHandler)
      ) as Promise<Message>;
    }

    return undefined;
  };
}

checkFido2FeatureEnabled();
