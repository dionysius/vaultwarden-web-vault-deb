import { getQsParam } from "./common";

require("./duo-redirect.scss");

const mobileDesktopCallback = "bitwarden://duo-callback";

window.addEventListener("load", () => {
  const client = getQsParam("client");
  const code = getQsParam("code");

  if (client === "browser" || client === "web") {
    const channel = new BroadcastChannel("duoResult");

    channel.postMessage({ code: code });
    channel.close();

    const handOffMessage = ("; " + document.cookie)
      .split("; duoHandOffMessage=")
      .pop()
      .split(";")
      .shift();

    document.cookie = "duoHandOffMessage=;SameSite=strict;max-age=0";

    const content = document.getElementById("content");
    content.innerHTML = "";

    const p = document.createElement("p");
    p.className = "text-center";
    p.innerText = handOffMessage;

    content.appendChild(p);
  } else if (client === "mobile" || client === "desktop") {
    document.location.replace(mobileDesktopCallback + "?code=" + encodeURIComponent(code));
  }
});
