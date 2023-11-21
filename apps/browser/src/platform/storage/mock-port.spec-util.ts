import { mockDeep } from "jest-mock-extended";

/**
 * Mocks a chrome.runtime.Port set up to send messages through `postMessage` to `onMessage.addListener` callbacks.
 * @returns a mock chrome.runtime.Port
 */
export function mockPort(name: string) {
  const port = mockDeep<chrome.runtime.Port>();
  // notify listeners of a new port
  (chrome.runtime.connect as jest.Mock).mockImplementation((portInfo) => {
    port.name = portInfo.name;
    (chrome.runtime.onConnect.addListener as jest.Mock).mock.calls.forEach(([callbackFn]) => {
      callbackFn(port);
    });
    return port;
  });

  // set message broadcast
  (port.postMessage as jest.Mock).mockImplementation((message) => {
    (port.onMessage.addListener as jest.Mock).mock.calls.forEach(([callbackFn]) => {
      callbackFn(message);
    });
  });
  return port;
}
