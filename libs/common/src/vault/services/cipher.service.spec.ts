// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { ApiService } from "../../abstractions/api.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { EncryptService } from "../../abstractions/encrypt.service";
import { FileUploadService } from "../../abstractions/fileUpload.service";
import { I18nService } from "../../abstractions/i18n.service";
import { LogService } from "../../abstractions/log.service";
import { SearchService } from "../../abstractions/search.service";
import { SettingsService } from "../../abstractions/settings.service";
import { StateService } from "../../abstractions/state.service";
import { EncArrayBuffer } from "../../models/domain/enc-array-buffer";
import { EncString } from "../../models/domain/enc-string";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { Cipher } from "../models/domain/cipher";

import { CipherService } from "./cipher.service";

const ENCRYPTED_TEXT = "This data has been encrypted";
const ENCRYPTED_BYTES = Substitute.for<EncArrayBuffer>();

describe("Cipher Service", () => {
  let cryptoService: SubstituteOf<CryptoService>;
  let stateService: SubstituteOf<StateService>;
  let settingsService: SubstituteOf<SettingsService>;
  let apiService: SubstituteOf<ApiService>;
  let fileUploadService: SubstituteOf<FileUploadService>;
  let i18nService: SubstituteOf<I18nService>;
  let searchService: SubstituteOf<SearchService>;
  let logService: SubstituteOf<LogService>;
  let encryptService: SubstituteOf<EncryptService>;

  let cipherService: CipherService;

  beforeEach(() => {
    cryptoService = Substitute.for<CryptoService>();
    stateService = Substitute.for<StateService>();
    settingsService = Substitute.for<SettingsService>();
    apiService = Substitute.for<ApiService>();
    fileUploadService = Substitute.for<FileUploadService>();
    i18nService = Substitute.for<I18nService>();
    searchService = Substitute.for<SearchService>();
    logService = Substitute.for<LogService>();
    encryptService = Substitute.for<EncryptService>();

    cryptoService.encryptToBytes(Arg.any(), Arg.any()).resolves(ENCRYPTED_BYTES);
    cryptoService.encrypt(Arg.any(), Arg.any()).resolves(new EncString(ENCRYPTED_TEXT));

    cipherService = new CipherService(
      cryptoService,
      settingsService,
      apiService,
      fileUploadService,
      i18nService,
      () => searchService,
      logService,
      stateService,
      encryptService
    );
  });

  it("attachments upload encrypted file contents", async () => {
    const fileName = "filename";
    const fileData = new Uint8Array(10).buffer;
    cryptoService.getOrgKey(Arg.any()).resolves(new SymmetricCryptoKey(new Uint8Array(32).buffer));

    await cipherService.saveAttachmentRawWithServer(new Cipher(), fileName, fileData);

    fileUploadService
      .received(1)
      .uploadCipherAttachment(Arg.any(), Arg.any(), new EncString(ENCRYPTED_TEXT), ENCRYPTED_BYTES);
  });
});
