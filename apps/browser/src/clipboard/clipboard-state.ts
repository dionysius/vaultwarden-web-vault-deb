import { BrowserStateService } from "../services/abstractions/browser-state.service";

const clearClipboardStorageKey = "clearClipboardTime";
export const getClearClipboardTime = async (stateService: BrowserStateService) => {
  return await stateService.getFromSessionMemory<number>(clearClipboardStorageKey);
};

export const setClearClipboardTime = async (stateService: BrowserStateService, time: number) => {
  await stateService.setInSessionMemory(clearClipboardStorageKey, time);
};
