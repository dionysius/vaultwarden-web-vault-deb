(function () {
  chrome.runtime.sendMessage({ command: "triggerFido2ContentScriptInjection" });
})();
