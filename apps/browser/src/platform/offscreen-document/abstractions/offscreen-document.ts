export type OffscreenDocumentExtensionMessage = {
  [key: string]: any;
  command: string;
  text?: string;
  decryptRequest?: string;
};

type OffscreenExtensionMessageEventParams = {
  message: OffscreenDocumentExtensionMessage;
  sender: chrome.runtime.MessageSender;
};

export type OffscreenDocumentExtensionMessageHandlers = {
  [key: string]: ({ message, sender }: OffscreenExtensionMessageEventParams) => any;
  offscreenCopyToClipboard: ({ message }: OffscreenExtensionMessageEventParams) => any;
  offscreenReadFromClipboard: () => any;
  offscreenDecryptItems: ({ message }: OffscreenExtensionMessageEventParams) => Promise<string>;
};

export interface OffscreenDocument {
  init(): void;
}

export abstract class OffscreenDocumentService {
  abstract withDocument<T>(
    reasons: chrome.offscreen.Reason[],
    justification: string,
    callback: () => Promise<T> | T,
  ): Promise<T>;
}
