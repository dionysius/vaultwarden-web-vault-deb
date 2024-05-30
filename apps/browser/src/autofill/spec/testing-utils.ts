import { mock } from "jest-mock-extended";

function triggerTestFailure() {
  expect(true).toBe("Test has failed.");
}

const scheduler = typeof setImmediate === "function" ? setImmediate : setTimeout;
function flushPromises() {
  return new Promise(function (resolve) {
    scheduler(resolve);
  });
}

function postWindowMessage(data: any, origin = "https://localhost/", source = window) {
  globalThis.dispatchEvent(new MessageEvent("message", { data, origin, source }));
}

function sendMockExtensionMessage(
  message: any,
  sender?: chrome.runtime.MessageSender,
  sendResponse?: CallableFunction,
) {
  (chrome.runtime.onMessage.addListener as unknown as jest.SpyInstance).mock.calls.forEach(
    (call) => {
      const callback = call[0];
      callback(
        message || {},
        sender || mock<chrome.runtime.MessageSender>(),
        sendResponse || jest.fn(),
      );
    },
  );
}

function triggerRuntimeOnConnectEvent(port: chrome.runtime.Port) {
  (chrome.runtime.onConnect.addListener as unknown as jest.SpyInstance).mock.calls.forEach(
    (call) => {
      const callback = call[0];
      callback(port);
    },
  );
}

function sendPortMessage(port: chrome.runtime.Port, message: any) {
  (port.onMessage.addListener as unknown as jest.SpyInstance).mock.calls.forEach((call) => {
    const callback = call[0];
    callback(message || {}, port);
  });
}

function triggerPortOnDisconnectEvent(port: chrome.runtime.Port) {
  (port.onDisconnect.addListener as unknown as jest.SpyInstance).mock.calls.forEach((call) => {
    const callback = call[0];
    callback(port);
  });
}

function triggerWindowOnFocusedChangedEvent(windowId: number) {
  (chrome.windows.onFocusChanged.addListener as unknown as jest.SpyInstance).mock.calls.forEach(
    (call) => {
      const callback = call[0];
      callback(windowId);
    },
  );
}

function triggerTabOnActivatedEvent(activeInfo: chrome.tabs.TabActiveInfo) {
  (chrome.tabs.onActivated.addListener as unknown as jest.SpyInstance).mock.calls.forEach(
    (call) => {
      const callback = call[0];
      callback(activeInfo);
    },
  );
}

function triggerTabOnReplacedEvent(addedTabId: number, removedTabId: number) {
  (chrome.tabs.onReplaced.addListener as unknown as jest.SpyInstance).mock.calls.forEach((call) => {
    const callback = call[0];
    callback(addedTabId, removedTabId);
  });
}

function triggerTabOnUpdatedEvent(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab,
) {
  (chrome.tabs.onUpdated.addListener as unknown as jest.SpyInstance).mock.calls.forEach((call) => {
    const callback = call[0];
    callback(tabId, changeInfo, tab);
  });
}

function triggerTabOnRemovedEvent(tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
  (chrome.tabs.onRemoved.addListener as unknown as jest.SpyInstance).mock.calls.forEach((call) => {
    const callback = call[0];
    callback(tabId, removeInfo);
  });
}

function mockQuerySelectorAllDefinedCall() {
  const originalDocumentQuerySelectorAll = document.querySelectorAll;
  document.querySelectorAll = function (selector: string) {
    return originalDocumentQuerySelectorAll.call(
      document,
      selector === ":defined" ? "*" : selector,
    );
  };

  const originalShadowRootQuerySelectorAll = ShadowRoot.prototype.querySelectorAll;
  ShadowRoot.prototype.querySelectorAll = function (selector: string) {
    return originalShadowRootQuerySelectorAll.call(this, selector === ":defined" ? "*" : selector);
  };

  const originalElementQuerySelectorAll = Element.prototype.querySelectorAll;
  Element.prototype.querySelectorAll = function (selector: string) {
    return originalElementQuerySelectorAll.call(this, selector === ":defined" ? "*" : selector);
  };

  return {
    mockRestore: () => {
      document.querySelectorAll = originalDocumentQuerySelectorAll;
      ShadowRoot.prototype.querySelectorAll = originalShadowRootQuerySelectorAll;
      Element.prototype.querySelectorAll = originalElementQuerySelectorAll;
    },
  };
}

export {
  triggerTestFailure,
  flushPromises,
  postWindowMessage,
  sendMockExtensionMessage,
  triggerRuntimeOnConnectEvent,
  sendPortMessage,
  triggerPortOnDisconnectEvent,
  triggerWindowOnFocusedChangedEvent,
  triggerTabOnActivatedEvent,
  triggerTabOnReplacedEvent,
  triggerTabOnUpdatedEvent,
  triggerTabOnRemovedEvent,
  mockQuerySelectorAllDefinedCall,
};
