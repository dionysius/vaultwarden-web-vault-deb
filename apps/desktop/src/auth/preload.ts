import { ipcRenderer } from "electron";

export default {
  getHcaptchaAccessibilityCookie: (): Promise<[string]> =>
    ipcRenderer.invoke("getCookie", { url: "https://www.hcaptcha.com/", name: "hc_accessibility" }),

  loginRequest: (alertTitle: string, alertBody: string, buttonText: string): Promise<void> =>
    ipcRenderer.invoke("loginRequest", {
      alertTitle,
      alertBody,
      buttonText,
    }),
};
