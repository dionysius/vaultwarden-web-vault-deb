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
} from "./key-definitions";

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
});
