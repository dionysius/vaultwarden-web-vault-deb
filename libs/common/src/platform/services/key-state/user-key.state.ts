import { KeyDefinition, CRYPTO_DISK } from "../../state";

export const USER_EVER_HAD_USER_KEY = new KeyDefinition<boolean>(CRYPTO_DISK, "everHadUserKey", {
  deserializer: (obj) => obj,
});
