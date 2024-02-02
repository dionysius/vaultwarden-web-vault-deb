import { getQsParam } from "./common";

require("./sso.scss");

window.addEventListener("load", () => {
  const code = getQsParam("code");
  const state = getQsParam("state");
  const lastpass = getQsParam("lp");

  if (lastpass === "1") {
    initiateBrowserSsoIfDocumentReady(code, state, true);
  } else if (state != null && state.includes(":clientId=browser")) {
    initiateBrowserSsoIfDocumentReady(code, state, false);
  } else {
    window.location.href = window.location.origin + "/#/sso?code=" + code + "&state=" + state;
    // Match any characters between "_returnUri='" and the next "'"
    const returnUri = extractFromRegex(state, "(?<=_returnUri=')(.*)(?=')");
    if (returnUri) {
      window.location.href = window.location.origin + `/#${returnUri}`;
    } else {
      window.location.href = window.location.origin + "/#/sso?code=" + code + "&state=" + state;
    }
  }
});

function initiateBrowserSsoIfDocumentReady(code: string, state: string, lastpass: boolean) {
  const MAX_ATTEMPTS = 200;
  const TIMEOUT_MS = 50;
  let attempts = 0;

  const pingInterval = setInterval(() => {
    if (attempts >= MAX_ATTEMPTS) {
      clearInterval(pingInterval);
      throw new Error("Failed to initiate browser SSO");
    }

    attempts++;
    window.postMessage({ command: "checkIfReadyForAuthResult" }, "*");
  }, TIMEOUT_MS);

  const handleWindowMessage = (event: MessageEvent) => {
    if (event.source === window && event.data?.command === "readyToReceiveAuthResult") {
      clearInterval(pingInterval);
      window.removeEventListener("message", handleWindowMessage);

      initiateBrowserSso(code, state, lastpass);
    }
  };

  window.addEventListener("message", handleWindowMessage);
}

function initiateBrowserSso(code: string, state: string, lastpass: boolean) {
  window.postMessage({ command: "authResult", code: code, state: state, lastpass: lastpass }, "*");
  const handOffMessage = ("; " + document.cookie)
    .split("; ssoHandOffMessage=")
    .pop()
    .split(";")
    .shift();
  document.cookie = "ssoHandOffMessage=;SameSite=strict;max-age=0";
  const content = document.getElementById("content");
  content.innerHTML = "";
  const p = document.createElement("p");
  p.innerText = handOffMessage;
  content.appendChild(p);
}

function extractFromRegex(s: string, regexString: string) {
  const regex = new RegExp(regexString);
  const results = regex.exec(s);

  if (!results) {
    return null;
  }

  return results[0];
}
