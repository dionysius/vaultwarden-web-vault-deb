import { CipherContextMenuHandler } from "../autofill/browser/cipher-context-menu-handler";
import { ContextMenuClickedHandler } from "../autofill/browser/context-menu-clicked-handler";

import { combine } from "./combine";
import { onCommandListener } from "./onCommandListener";
import { onInstallListener } from "./onInstallListener";
import { UpdateBadge } from "./update-badge";

const tabsOnActivatedListener = combine([
  UpdateBadge.tabsOnActivatedListener,
  CipherContextMenuHandler.tabsOnActivatedListener,
]);

const tabsOnReplacedListener = combine([
  UpdateBadge.tabsOnReplacedListener,
  CipherContextMenuHandler.tabsOnReplacedListener,
]);

const tabsOnUpdatedListener = combine([
  UpdateBadge.tabsOnUpdatedListener,
  CipherContextMenuHandler.tabsOnUpdatedListener,
]);

const contextMenusClickedListener = ContextMenuClickedHandler.onClickedListener;

// TODO: All message listeners should be RuntimeMessage in Notifications follow up then this type annotation can be inferred
const runtimeMessageListener = combine<
  [message: { command: string }, sender: chrome.runtime.MessageSender]
>([
  UpdateBadge.messageListener,
  CipherContextMenuHandler.messageListener,
  ContextMenuClickedHandler.messageListener,
]);

export {
  tabsOnActivatedListener,
  tabsOnReplacedListener,
  tabsOnUpdatedListener,
  contextMenusClickedListener,
  runtimeMessageListener,
  onCommandListener,
  onInstallListener,
};
