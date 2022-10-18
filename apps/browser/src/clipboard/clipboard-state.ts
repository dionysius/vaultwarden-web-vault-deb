import { StateService } from "../services/abstractions/state.service";

const clearClipboardStorageKey = "clearClipboardTime";
export const getClearClipboardTime = async (stateService: StateService) => {
  return await stateService.getFromSessionMemory<number>(clearClipboardStorageKey);
};

export const setClearClipboardTime = async (stateService: StateService, time: number) => {
  await stateService.setInSessionMemory(clearClipboardStorageKey, time);
};
