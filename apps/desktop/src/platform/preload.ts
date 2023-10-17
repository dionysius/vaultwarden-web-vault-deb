import { ipcRenderer } from "electron";

import { DeviceType, ThemeType } from "@bitwarden/common/enums";

import { isDev, isWindowsStore } from "../utils";

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
