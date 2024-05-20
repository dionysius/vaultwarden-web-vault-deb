import { mock } from "jest-mock-extended";

import { GeneratedCredential } from "./history";
import { LegacyPasswordHistoryDecryptor } from "./history/legacy-password-history-decryptor";
import {
  EFF_USERNAME_SETTINGS,
  CATCHALL_SETTINGS,
  SUBADDRESS_SETTINGS,
  PASSPHRASE_SETTINGS,
  PASSWORD_SETTINGS,
  SIMPLE_LOGIN_FORWARDER,
  FORWARD_EMAIL_FORWARDER,
  FIREFOX_RELAY_FORWARDER,
  FASTMAIL_FORWARDER,
  DUCK_DUCK_GO_FORWARDER,
  ADDY_IO_FORWARDER,
  GENERATOR_SETTINGS,
  ADDY_IO_BUFFER,
  DUCK_DUCK_GO_BUFFER,
  FASTMAIL_BUFFER,
  FIREFOX_RELAY_BUFFER,
  FORWARD_EMAIL_BUFFER,
  SIMPLE_LOGIN_BUFFER,
  GENERATOR_HISTORY_BUFFER,
} from "./key-definitions";
import { GeneratedPasswordHistory } from "./password";

describe("Key definitions", () => {
  describe("GENERATOR_SETTINGS", () => {
    it("should pass through deserialization", () => {
      const value = {};
      const result = GENERATOR_SETTINGS.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("PASSWORD_SETTINGS", () => {
    it("should pass through deserialization", () => {
      const value = {};
      const result = PASSWORD_SETTINGS.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("PASSPHRASE_SETTINGS", () => {
    it("should pass through deserialization", () => {
      const value = {};
      const result = PASSPHRASE_SETTINGS.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("EFF_USERNAME_SETTINGS", () => {
    it("should pass through deserialization", () => {
      const value = { website: null as string };
      const result = EFF_USERNAME_SETTINGS.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("CATCHALL_SETTINGS", () => {
    it("should pass through deserialization", () => {
      const value = { website: null as string };
      const result = CATCHALL_SETTINGS.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("SUBADDRESS_SETTINGS", () => {
    it("should pass through deserialization", () => {
      const value = { website: null as string };
      const result = SUBADDRESS_SETTINGS.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("ADDY_IO_FORWARDER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = ADDY_IO_FORWARDER.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("DUCK_DUCK_GO_FORWARDER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = DUCK_DUCK_GO_FORWARDER.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("FASTMAIL_FORWARDER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = FASTMAIL_FORWARDER.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("FIREFOX_RELAY_FORWARDER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = FIREFOX_RELAY_FORWARDER.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("FORWARD_EMAIL_FORWARDER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = FORWARD_EMAIL_FORWARDER.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("SIMPLE_LOGIN_FORWARDER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};
      const result = SIMPLE_LOGIN_FORWARDER.deserializer(value);
      expect(result).toBe(value);
    });
  });

  describe("ADDY_IO_BUFFER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};

      const result = ADDY_IO_BUFFER.options.deserializer(value);

      expect(result).toBe(value);
    });
  });

  describe("DUCK_DUCK_GO_BUFFER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};

      const result = DUCK_DUCK_GO_BUFFER.options.deserializer(value);

      expect(result).toBe(value);
    });
  });

  describe("FASTMAIL_BUFFER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};

      const result = FASTMAIL_BUFFER.options.deserializer(value);

      expect(result).toBe(value);
    });
  });

  describe("FIREFOX_RELAY_BUFFER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};

      const result = FIREFOX_RELAY_BUFFER.options.deserializer(value);

      expect(result).toBe(value);
    });
  });

  describe("FORWARD_EMAIL_BUFFER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};

      const result = FORWARD_EMAIL_BUFFER.options.deserializer(value);

      expect(result).toBe(value);
    });
  });

  describe("SIMPLE_LOGIN_BUFFER", () => {
    it("should pass through deserialization", () => {
      const value: any = {};

      const result = SIMPLE_LOGIN_BUFFER.options.deserializer(value);

      expect(result).toBe(value);
    });
  });

  describe("GENERATOR_HISTORY_BUFFER", () => {
    describe("options.deserializer", () => {
      it("should deserialize generated password history", () => {
        const value: any = [{ password: "foo", date: 1 }];

        const [result] = GENERATOR_HISTORY_BUFFER.options.deserializer(value);

        expect(result).toEqual(value[0]);
        expect(result).toBeInstanceOf(GeneratedPasswordHistory);
      });

      it.each([[undefined], [null]])("should ignore nullish (= %p) history", (value: any) => {
        const result = GENERATOR_HISTORY_BUFFER.options.deserializer(value);

        expect(result).toEqual(undefined);
      });
    });

    it("should map generated password history to generated credentials", async () => {
      const value: any = [new GeneratedPasswordHistory("foo", 1)];
      const decryptor = mock<LegacyPasswordHistoryDecryptor>({
        decrypt(value) {
          return Promise.resolve(value);
        },
      });

      const [result] = await GENERATOR_HISTORY_BUFFER.map(value, decryptor);

      expect(result).toEqual({
        credential: "foo",
        category: "password",
        generationDate: new Date(1),
      });
      expect(result).toBeInstanceOf(GeneratedCredential);
    });

    describe("isValid", () => {
      it("should accept histories with at least one entry", async () => {
        const value: any = [new GeneratedPasswordHistory("foo", 1)];
        const decryptor = {} as any;

        const result = await GENERATOR_HISTORY_BUFFER.isValid(value, decryptor);

        expect(result).toEqual(true);
      });

      it("should reject histories with no entries", async () => {
        const value: any = [];
        const decryptor = {} as any;

        const result = await GENERATOR_HISTORY_BUFFER.isValid(value, decryptor);

        expect(result).toEqual(false);
      });
    });
  });
});
