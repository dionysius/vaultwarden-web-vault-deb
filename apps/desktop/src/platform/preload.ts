import { ipcRenderer } from "electron";

import { DeviceType, ThemeType } from "@bitwarden/common/enums";

import { isDev, isWindowsStore } from "../utils";

const storage = {
  get: <T>(key: string): Promise<T> => ipcRenderer.invoke("storageService", { action: "get", key }),
  has: (key: string): Promise<boolean> =>
    ipcRenderer.invoke("storageService", { action: "has", key }),
  save: (key: string, obj: any): Promise<void> =>
    ipcRenderer.invoke("storageService", { action: "save", key, obj }),
  remove: (key: string): Promise<void> =>
    ipcRenderer.invoke("storageService", { action: "remove", key }),
};

const passwords = {
  get: (key: string, keySuffix: string): Promise<string> =>
    ipcRenderer.invoke("keytar", { action: "getPassword", key, keySuffix }),
  has: (key: string, keySuffix: string): Promise<boolean> =>
    ipcRenderer.invoke("keytar", { action: "hasPassword", key, keySuffix }),
  set: (key: string, keySuffix: string, value: string): Promise<void> =>
    ipcRenderer.invoke("keytar", { action: "setPassword", key, keySuffix, value }),
  delete: (key: string, keySuffix: string): Promise<void> =>
    ipcRenderer.invoke("keytar", { action: "deletePassword", key, keySuffix }),
};

export default {
  versions: {
    app: (): Promise<string> => ipcRenderer.invoke("appVersion"),
  },
  deviceType: deviceType(),
  isDev: isDev(),
  isWindowsStore: isWindowsStore(),
  reloadProcess: () => ipcRenderer.send("reload-process"),

  getSystemTheme: (): Promise<ThemeType> => ipcRenderer.invoke("systemTheme"),
  onSystemThemeUpdated: (callback: (theme: ThemeType) => void) => {
    ipcRenderer.on("systemThemeUpdated", (_event, theme: ThemeType) => callback(theme));
  },

  sendMessage: (message: { command: string } & any) =>
    ipcRenderer.send("messagingService", message),
  onMessage: (callback: (message: { command: string } & any) => void) => {
    ipcRenderer.on("messagingService", (_event, message: any) => {
      if (message.command) {
        callback(message);
      }
    });
  },

  storage,
  passwords,
};

function deviceType(): DeviceType {
  switch (process.platform) {
    case "win32":
      return DeviceType.WindowsDesktop;
    case "darwin":
      return DeviceType.MacOsDesktop;
    default:
      return DeviceType.LinuxDesktop;
  }
}
