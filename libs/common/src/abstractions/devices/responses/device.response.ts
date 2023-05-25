import { DeviceType } from "../../../enums";
import { BaseResponse } from "../../../models/response/base.response";

export class DeviceResponse extends BaseResponse {
  id: string;
  name: number;
  identifier: string;
  type: DeviceType;
  creationDate: string;
  encryptedUserKey: string;
  encryptedPublicKey: string;
  encryptedPrivateKey: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.name = this.getResponseProperty("Name");
    this.identifier = this.getResponseProperty("Identifier");
    this.type = this.getResponseProperty("Type");
    this.creationDate = this.getResponseProperty("CreationDate");
    this.encryptedUserKey = this.getResponseProperty("EncryptedUserKey");
    this.encryptedPublicKey = this.getResponseProperty("EncryptedPublicKey");
    this.encryptedPrivateKey = this.getResponseProperty("EncryptedPrivateKey");
  }
}
