// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { ApiService } from "../../abstractions/api.service";
import { SearchService } from "../../abstractions/search.service";
import { SettingsService } from "../../abstractions/settings.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { EncryptService } from "../../platform/abstractions/encrypt.service";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { StateService } from "../../platform/abstractions/state.service";
import { EncArrayBuffer } from "../../platform/models/domain/enc-array-buffer";
import { EncString } from "../../platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "../../platform/models/domain/symmetric-crypto-key";
import { CipherFileUploadService } from "../abstractions/file-upload/cipher-file-upload.service";
import { Cipher } from "../models/domain/cipher";

import { CipherService } from "./cipher.service";

const ENCRYPTED_TEXT = "This data has been encrypted";
const ENCRYPTED_BYTES = Substitute.for<EncArrayBuffer>();

describe("Cipher Service", () => {
  let cryptoService: SubstituteOf<CryptoService>;
  let stateService: SubstituteOf<StateService>;
  let settingsService: SubstituteOf<SettingsService>;
  let apiService: SubstituteOf<ApiService>;
  let cipherFileUploadService: SubstituteOf<CipherFileUploadService>;
  let i18nService: SubstituteOf<I18nService>;
  let searchService: SubstituteOf<SearchService>;
  let encryptService: SubstituteOf<EncryptService>;

  let cipherService: CipherService;

  beforeEach(() => {
    cryptoService = Substitute.for<CryptoService>();
    stateService = Substitute.for<StateService>();
    settingsService = Substitute.for<SettingsService>();
    apiService = Substitute.for<ApiService>();
    cipherFileUploadService = Substitute.for<CipherFileUploadService>();
    i18nService = Substitute.for<I18nService>();
    searchService = Substitute.for<SearchService>();
    encryptService = Substitute.for<EncryptService>();

    cryptoService.encryptToBytes(Arg.any(), Arg.any()).resolves(ENCRYPTED_BYTES);
    cryptoService.encrypt(Arg.any(), Arg.any()).resolves(new EncString(ENCRYPTED_TEXT));

    cipherService = new CipherService(
      cryptoService,
      settingsService,
      apiService,
      i18nService,
      searchService,
      stateService,
      encryptService,
      cipherFileUploadService
    );
  });

  it("attachments upload encrypted file contents", async () => {
    const fileName = "filename";
    const fileData = new Uint8Array(10).buffer;
    cryptoService.getOrgKey(Arg.any()).resolves(new SymmetricCryptoKey(new Uint8Array(32).buffer));

    await cipherService.saveAttachmentRawWithServer(new Cipher(), fileName, fileData);

    cipherFileUploadService
      .received(1)
      .upload(Arg.any(), Arg.any(), ENCRYPTED_BYTES, Arg.any(), Arg.any());
  });
});
