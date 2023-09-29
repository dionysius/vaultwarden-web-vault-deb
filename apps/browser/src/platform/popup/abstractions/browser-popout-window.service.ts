import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";

interface BrowserPopoutWindowService {
  openUnlockPrompt(senderWindowId: number): Promise<void>;
  closeUnlockPrompt(): Promise<void>;
  openPasswordRepromptPrompt(
    senderWindowId: number,
    promptData: {
      action: string;
      cipherId: string;
      senderTabId: number;
    }
  ): Promise<void>;
  openCipherCreation(
    senderWindowId: number,
    promptData: {
      cipherType?: CipherType;
      senderTabId: number;
      senderTabURI: string;
    }
  ): Promise<void>;
  openCipherEdit(
    senderWindowId: number,
    promptData: {
      cipherId: string;
      senderTabId: number;
      senderTabURI: string;
    }
  ): Promise<void>;
  closePasswordRepromptPrompt(): Promise<void>;
}

export { BrowserPopoutWindowService };
