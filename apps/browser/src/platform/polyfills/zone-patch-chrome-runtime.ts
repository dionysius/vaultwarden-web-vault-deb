/**
 * Monkey patch `chrome.runtime.onMessage` event listeners to run in the Angular zone.
 */
Zone.__load_patch("ChromeRuntimeOnMessage", (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  if (typeof global?.chrome?.runtime?.onMessage === "undefined") {
    return;
  }
  const onMessage = global.chrome.runtime.onMessage;

  // eslint-disable-next-line @typescript-eslint/ban-types
  const nativeAddListener = onMessage.addListener as Function;
  api.ObjectDefineProperty(chrome.runtime.onMessage, "addListener", {
    value: function (...args: any[]) {
      const callback = args.length > 0 ? args[0] : null;
      if (typeof callback === "function") {
        const wrapperedCallback = Zone.current.wrap(callback, "ChromeRuntimeOnMessage");
        callback[api.symbol("chromeRuntimeOnMessageCallback")] = wrapperedCallback;
        return nativeAddListener.call(onMessage, wrapperedCallback);
      } else {
        return nativeAddListener.apply(onMessage, args);
      }
    },
    writable: false,
  });

  // eslint-disable-next-line @typescript-eslint/ban-types
  const nativeRemoveListener = onMessage.removeListener as Function;
  api.ObjectDefineProperty(chrome.runtime.onMessage, "removeListener", {
    value: function (...args: any[]) {
      const callback = args.length > 0 ? args[0] : null;
      if (typeof callback === "function") {
        const wrapperedCallback = callback[api.symbol("chromeRuntimeOnMessageCallback")];
        if (wrapperedCallback) {
          return nativeRemoveListener.call(onMessage, wrapperedCallback);
        } else {
          return nativeRemoveListener.apply(onMessage, args);
        }
      } else {
        return nativeRemoveListener.apply(onMessage, args);
      }
    },
    writable: false,
  });
});
