import { Utils } from "../../misc/utils";
import { AttachmentData } from "../data/attachmentData";
import { AttachmentView } from "../view/attachmentView";

import Domain from "./domainBase";
import { EncString } from "./encString";
import { SymmetricCryptoKey } from "./symmetricCryptoKey";

export class Attachment extends Domain {
  id: string;
  url: string;
  size: string;
  sizeName: string; // Readable size, ex: "4.2 KB" or "1.43 GB"
  key: EncString;
  fileName: EncString;

  constructor(obj?: AttachmentData) {
    super();
    if (obj == null) {
      return;
    }

    this.size = obj.size;
    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        url: null,
        sizeName: null,
        fileName: null,
        key: null,
      },
      ["id", "url", "sizeName"]
    );
  }

  async decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<AttachmentView> {
    const view = await this.decryptObj(
      new AttachmentView(this),
      {
        fileName: null,
      },
      orgId,
      encKey
    );

    if (this.key != null) {
      view.key = await this.decryptAttachmentKey(orgId, encKey);
    }

    return view;
  }

  private async decryptAttachmentKey(orgId: string, encKey?: SymmetricCryptoKey) {
    try {
      if (encKey == null) {
        encKey = await this.getKeyForDecryption(orgId);
      }

      const encryptService = Utils.getContainerService().getEncryptService();
      const decValue = await encryptService.decryptToBytes(this.key, encKey);
      return new SymmetricCryptoKey(decValue);
    } catch (e) {
      // TODO: error?
    }
  }

  private async getKeyForDecryption(orgId: string) {
    const cryptoService = Utils.getContainerService().getCryptoService();
    return orgId != null
      ? await cryptoService.getOrgKey(orgId)
      : await cryptoService.getKeyForUserEncryption();
  }

  toAttachmentData(): AttachmentData {
    const a = new AttachmentData();
    a.size = this.size;
    this.buildDataModel(
      this,
      a,
      {
        id: null,
        url: null,
        sizeName: null,
        fileName: null,
        key: null,
      },
      ["id", "url", "sizeName"]
    );
    return a;
  }
}
