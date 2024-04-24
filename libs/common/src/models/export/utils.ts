import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

export function safeGetString(value: string | EncString) {
  if (value == null) {
    return null;
  }

  if (typeof value == "string") {
    return value;
  }
  return value?.encryptedString;
}
