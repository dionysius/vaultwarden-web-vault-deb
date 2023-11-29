import { Observable } from "rxjs";

import { EncArrayBuffer } from "../../../platform/models/domain/enc-array-buffer";
import { SymmetricCryptoKey } from "../../../platform/models/domain/symmetric-crypto-key";
import { SendData } from "../models/data/send.data";
import { Send } from "../models/domain/send";
import { SendView } from "../models/view/send.view";

export abstract class SendService {
  sends$: Observable<Send[]>;
  sendViews$: Observable<SendView[]>;

  encrypt: (
    model: SendView,
    file: File | ArrayBuffer,
    password: string,
    key?: SymmetricCryptoKey,
  ) => Promise<[Send, EncArrayBuffer]>;
  get: (id: string) => Send;
  /**
   * @deprecated Do not call this, use the sends$ observable collection
   */
  getAll: () => Promise<Send[]>;
  /**
   * @deprecated Only use in CLI
   */
  getFromState: (id: string) => Promise<Send>;
  /**
   * @deprecated Only use in CLI
   */
  getAllDecryptedFromState: () => Promise<SendView[]>;
}

export abstract class InternalSendService extends SendService {
  upsert: (send: SendData | SendData[]) => Promise<any>;
  replace: (sends: { [id: string]: SendData }) => Promise<void>;
  clear: (userId: string) => Promise<any>;
  delete: (id: string | string[]) => Promise<any>;
}
