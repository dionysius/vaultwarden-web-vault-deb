import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

type OverlayButtonMessage = { command: string };

type UpdateAuthStatusMessage = OverlayButtonMessage & { authStatus: AuthenticationStatus };

type InitAutofillOverlayButtonMessage = UpdateAuthStatusMessage & {
  styleSheetUrl: string;
  translations: Record<string, string>;
};

type OverlayButtonWindowMessageHandlers = {
  [key: string]: CallableFunction;
  initAutofillOverlayButton: ({ message }: { message: InitAutofillOverlayButtonMessage }) => void;
  checkAutofillOverlayButtonFocused: () => void;
  updateAutofillOverlayButtonAuthStatus: ({
    message,
  }: {
    message: UpdateAuthStatusMessage;
  }) => void;
};

export {
  UpdateAuthStatusMessage,
  InitAutofillOverlayButtonMessage,
  OverlayButtonWindowMessageHandlers,
};
