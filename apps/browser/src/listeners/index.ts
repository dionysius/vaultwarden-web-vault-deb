import { CipherContextMenuHandler } from "../browser/cipher-context-menu-handler";
import { ContextMenuClickedHandler } from "../browser/context-menu-clicked-handler";

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

const runtimeMessageListener = combine([
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
