import { getQsParam } from "./common";

require("./duo-redirect.scss");

const mobileDesktopCallback = "bitwarden://duo-callback";

window.addEventListener("load", () => {
  const client = getQsParam("client");
  const code = getQsParam("code");

  if (client === "web") {
    const channel = new BroadcastChannel("duoResult");

    channel.postMessage({ code: code });
    channel.close();

    processAndDisplayHandoffMessage();
  } else if (client === "browser") {
    window.postMessage({ command: "duoResult", code: code }, "*");
    processAndDisplayHandoffMessage();
  } else if (client === "mobile" || client === "desktop") {
    document.location.replace(mobileDesktopCallback + "?code=" + encodeURIComponent(code));
  }
});

/**
 * The `duoHandOffMessage` must be set in the client via a cookie. This is so
 * we can make use of i18n translations.
 *
 * Format the message as an object and set is as a cookie. The following gives an
 * example (be sure to replace strings with i18n translated text):
 *
 * ```
 * const duoHandOffMessage = {
 *  title: "You successfully logged in",
 *  message: "This window will automatically close in 5 seconds",
 *  buttonText: "Close",
 *  isCountdown: true
 * };
 *
 * document.cookie = `duoHandOffMessage=${encodeURIComponent(JSON.stringify(duoHandOffMessage))};SameSite=strict`;
 *
 * ```
 *
 * The `title`, `message`, and `buttonText` properties will be used to create the
 * relevant DOM elements.
 *
 * Countdown timer:
 * The `isCountdown` signifies that you want to start a countdown timer that will
 * automatically close the tab when finished. The starting point for the timer will
 * be based upon the first number that can be parsed from the `message` property
 * (so be sure to add exactly one number to the `message`).
 *
 * This implementation makes it so the client does not have to split up the `message` into
 * three translations, such as:
 *    ['This window will automatically close in', '5', 'seconds']
 * ...which would cause bad translations in languages that swap the order of words.
 *
 * If `isCountdown` is undefined/false, there will be no countdown timer and the user
 * will simply have to close the tab manually.
 */
function processAndDisplayHandoffMessage() {
  const handOffMessageCookie = ("; " + document.cookie)

    .split("; duoHandOffMessage=")
    .pop()
    .split(";")
    .shift();
  const handOffMessage = JSON.parse(decodeURIComponent(handOffMessageCookie));

  // Clear the cookie
  document.cookie = "duoHandOffMessage=;SameSite=strict;max-age=0";

  const content = document.getElementById("content");
  content.className = "text-center";
  content.innerHTML = "";

  const h1 = document.createElement("h1");
  const p = document.createElement("p");
  const button = document.createElement("button");

  h1.textContent = handOffMessage.title;
  p.textContent = handOffMessage.message;
  button.textContent = handOffMessage.buttonText;

  h1.className = "font-weight-semibold";
  p.className = "mb-4";
  button.className = "bg-primary text-white border-0 rounded py-2 px-3";

  button.addEventListener("click", () => {
    window.close();
  });

  content.appendChild(h1);
  content.appendChild(p);
  content.appendChild(button);

  // Countdown timer (closes tab upon completion)
  if (handOffMessage.isCountdown) {
    let num = Number(p.textContent.match(/\d+/)[0]);

    const interval = setInterval(() => {
      if (num > 1) {
        p.textContent = p.textContent.replace(String(num), String(num - 1));
        num--;
      } else {
        clearInterval(interval);
        window.close();
      }
    }, 1000);
  }
}
