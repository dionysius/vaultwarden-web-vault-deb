import { DeviceKey } from "../platform/models/domain/symmetric-crypto-key";

import { DeviceResponse } from "./devices/responses/device.response";

export abstract class DeviceCryptoServiceAbstraction {
  trustDevice: () => Promise<DeviceResponse>;
  getDeviceKey: () => Promise<DeviceKey>;
}
