// Adds Duo functionality to the module-specific Ui class.
export abstract class DuoUi {
  // To cancel return null
  chooseDuoFactor: (devices: [DuoDevice]) => DuoChoice;
  // To cancel return null or blank
  provideDuoPasscode: (device: DuoDevice) => string;
  // This updates the UI with the messages from the server.
  updateDuoStatus: (status: DuoStatus, text: string) => void;
}

export enum DuoFactor {
  Push,
  Call,
  Passcode,
  SendPasscodesBySms,
}

export enum DuoStatus {
  Success,
  Error,
  Info,
}

export interface DuoChoice {
  device: DuoDevice;
  factor: DuoFactor;
  rememberMe: boolean;
}

export interface DuoDevice {
  id: string;
  name: string;
  factors: DuoFactor[];
}
