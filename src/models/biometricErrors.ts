type BiometricError = {
  title: string;
  description: string;
};

export type BiometricErrorTypes = "startDesktop" | "desktopIntegrationDisabled";

export const BiometricErrors: Record<BiometricErrorTypes, BiometricError> = {
  startDesktop: {
    title: "startDesktopTitle",
    description: "startDesktopDesc",
  },
  desktopIntegrationDisabled: {
    title: "desktopIntegrationDisabledTitle",
    description: "desktopIntegrationDisabledDesc",
  },
};
