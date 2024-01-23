/**
 * include structuredClone in test environment.
 * @jest-environment ../../../../shared/test.environment.ts
 */
import { EncryptService } from "../../../../platform/abstractions/encrypt.service";
import { EncString } from "../../../../platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "../../../../platform/models/domain/symmetric-crypto-key";

import { DefaultOptions, Forwarders } from "./constants";
import { ApiOptions } from "./forwarder-options";
import { UsernameGeneratorOptions, MaybeLeakedOptions } from "./generator-options";
import {
  getForwarderOptions,
  falsyDefault,
  encryptInPlace,
  decryptInPlace,
  forAllForwarders,
} from "./utilities";

const TestOptions: UsernameGeneratorOptions = {
  type: "word",
  website: "example.com",
  word: {
    capitalize: true,
    includeNumber: true,
  },
  subaddress: {
    algorithm: "random",
    email: "foo@example.com",
  },
  catchall: {
    algorithm: "random",
    domain: "example.com",
  },
  forwarders: {
    service: Forwarders.Fastmail.id,
    fastMail: {
      domain: "httpbin.com",
      prefix: "foo",
      token: "some-token",
    },
    addyIo: {
      baseUrl: "https://app.addy.io",
      domain: "example.com",
      token: "some-token",
    },
    forwardEmail: {
      token: "some-token",
      domain: "example.com",
    },
    simpleLogin: {
      baseUrl: "https://app.simplelogin.io",
      token: "some-token",
    },
    duckDuckGo: {
      token: "some-token",
    },
    firefoxRelay: {
      token: "some-token",
    },
  },
};

function mockEncryptService(): EncryptService {
  return {
    encrypt: jest
      .fn()
      .mockImplementation((plainText: string, _key: SymmetricCryptoKey) => plainText),
    decryptToUtf8: jest
      .fn()
      .mockImplementation((cryptoText: string, _key: SymmetricCryptoKey) => cryptoText),
  } as unknown as EncryptService;
}

describe("Username Generation Options", () => {
  describe("forAllForwarders", () => {
    it("runs the function on every forwarder.", () => {
      const result = forAllForwarders(TestOptions, (_, id) => id);
      expect(result).toEqual([
        "anonaddy",
        "duckduckgo",
        "fastmail",
        "firefoxrelay",
        "forwardemail",
        "simplelogin",
      ]);
    });
  });

  describe("getForwarderOptions", () => {
    it("should return null for unsupported services", () => {
      expect(getForwarderOptions("unsupported", DefaultOptions)).toBeNull();
    });

    let options: UsernameGeneratorOptions = null;
    beforeEach(() => {
      options = structuredClone(TestOptions);
    });

    it.each([
      [TestOptions.forwarders.addyIo, "anonaddy"],
      [TestOptions.forwarders.duckDuckGo, "duckduckgo"],
      [TestOptions.forwarders.fastMail, "fastmail"],
      [TestOptions.forwarders.firefoxRelay, "firefoxrelay"],
      [TestOptions.forwarders.forwardEmail, "forwardemail"],
      [TestOptions.forwarders.simpleLogin, "simplelogin"],
    ])("should return an %s for %p", (forwarderOptions, service) => {
      const forwarder = getForwarderOptions(service, options);
      expect(forwarder).toEqual(forwarderOptions);
    });

    it("should return a reference to the forwarder", () => {
      const forwarder = getForwarderOptions("anonaddy", options);
      expect(forwarder).toBe(options.forwarders.addyIo);
    });
  });

  describe("falsyDefault", () => {
    it("should not modify values with truthy items", () => {
      const input = {
        a: "a",
        b: 1,
        d: [1],
      };

      const output = falsyDefault(input, {
        a: "b",
        b: 2,
        d: [2],
      });

      expect(output).toEqual(input);
    });

    it("should modify values with falsy items", () => {
      const input = {
        a: "",
        b: 0,
        c: false,
        d: [] as number[],
        e: [0] as number[],
        f: null as string,
        g: undefined as string,
      };

      const output = falsyDefault(input, {
        a: "a",
        b: 1,
        c: true,
        d: [1],
        e: [1],
        f: "a",
        g: "a",
      });

      expect(output).toEqual({
        a: "a",
        b: 1,
        c: true,
        d: [1],
        e: [1],
        f: "a",
        g: "a",
      });
    });

    it("should traverse nested objects", () => {
      const input = {
        a: {
          b: {
            c: "",
          },
        },
      };

      const output = falsyDefault(input, {
        a: {
          b: {
            c: "c",
          },
        },
      });

      expect(output).toEqual({
        a: {
          b: {
            c: "c",
          },
        },
      });
    });

    it("should add missing defaults", () => {
      const input = {};

      const output = falsyDefault(input, {
        a: "a",
        b: [1],
        c: {},
        d: { e: 1 },
      });

      expect(output).toEqual({
        a: "a",
        b: [1],
        c: {},
        d: { e: 1 },
      });
    });

    it("should ignore missing defaults", () => {
      const input = {
        a: "",
        b: 0,
        c: false,
        d: [] as number[],
        e: [0] as number[],
        f: null as string,
        g: undefined as string,
      };

      const output = falsyDefault(input, {});

      expect(output).toEqual({
        a: "",
        b: 0,
        c: false,
        d: [] as number[],
        e: [0] as number[],
        f: null as string,
        g: undefined as string,
      });
    });

    it.each([[null], [undefined]])("should ignore %p defaults", (defaults) => {
      const input = {
        a: "",
        b: 0,
        c: false,
        d: [] as number[],
        e: [0] as number[],
        f: null as string,
        g: undefined as string,
      };

      const output = falsyDefault(input, defaults);

      expect(output).toEqual({
        a: "",
        b: 0,
        c: false,
        d: [] as number[],
        e: [0] as number[],
        f: null as string,
        g: undefined as string,
      });
    });
  });

  describe("encryptInPlace", () => {
    it("should return without encrypting if a token was not supplied", async () => {
      const encryptService = mockEncryptService();

      // throws if modified, failing the test
      const options = Object.freeze({});
      await encryptInPlace(encryptService, null, options);

      expect(encryptService.encrypt).toBeCalledTimes(0);
    });

    it.each([
      ["a token", { token: "a token" }, `{"token":"a token"}${"0".repeat(493)}`, "a key"],
      [
        "a token and wasPlainText",
        { token: "a token", wasPlainText: true },
        `{"token":"a token","wasPlainText":true}${"0".repeat(473)}`,
        "another key",
      ],
      [
        "a really long token",
        { token: `a ${"really ".repeat(50)}long token` },
        `{"token":"a ${"really ".repeat(50)}long token"}${"0".repeat(138)}`,
        "a third key",
      ],
      [
        "a really long token and wasPlainText",
        { token: `a ${"really ".repeat(50)}long token`, wasPlainText: true },
        `{"token":"a ${"really ".repeat(50)}long token","wasPlainText":true}${"0".repeat(118)}`,
        "a key",
      ],
    ] as unknown as [string, ApiOptions & MaybeLeakedOptions, string, SymmetricCryptoKey][])(
      "encrypts %s and removes encrypted values",
      async (_description, options, encryptedToken, key) => {
        const encryptService = mockEncryptService();

        await encryptInPlace(encryptService, key, options);

        expect(options.encryptedToken).toEqual(encryptedToken);
        expect(options).not.toHaveProperty("token");
        expect(options).not.toHaveProperty("wasPlainText");

        // Why `encryptedToken`? The mock outputs its input without encryption.
        expect(encryptService.encrypt).toBeCalledWith(encryptedToken, key);
      },
    );
  });

  describe("decryptInPlace", () => {
    it("should return without decrypting if an encryptedToken was not supplied", async () => {
      const encryptService = mockEncryptService();

      // throws if modified, failing the test
      const options = Object.freeze({});
      await decryptInPlace(encryptService, null, options);

      expect(encryptService.decryptToUtf8).toBeCalledTimes(0);
    });

    it.each([
      ["a simple token", `{"token":"a token"}${"0".repeat(493)}`, { token: "a token" }, "a key"],
      [
        "a simple leaked token",
        `{"token":"a token","wasPlainText":true}${"0".repeat(473)}`,
        { token: "a token", wasPlainText: true },
        "another key",
      ],
      [
        "a long token",
        `{"token":"a ${"really ".repeat(50)}long token"}${"0".repeat(138)}`,
        { token: `a ${"really ".repeat(50)}long token` },
        "a third key",
      ],
      [
        "a long leaked token",
        `{"token":"a ${"really ".repeat(50)}long token","wasPlainText":true}${"0".repeat(118)}`,
        { token: `a ${"really ".repeat(50)}long token`, wasPlainText: true },
        "a key",
      ],
    ] as [string, string, ApiOptions & MaybeLeakedOptions, string][])(
      "decrypts %s and removes encrypted values",
      async (_description, encryptedTokenString, expectedOptions, keyString) => {
        const encryptService = mockEncryptService();

        // cast through unknown to avoid type errors; the mock doesn't need the real types
        // since it just outputs its input
        const key = keyString as unknown as SymmetricCryptoKey;
        const encryptedToken = encryptedTokenString as unknown as EncString;

        const actualOptions = { encryptedToken } as any;

        await decryptInPlace(encryptService, key, actualOptions);

        expect(actualOptions.token).toEqual(expectedOptions.token);
        expect(actualOptions.wasPlainText).toEqual(expectedOptions.wasPlainText);
        expect(actualOptions).not.toHaveProperty("encryptedToken");

        // Why `encryptedToken`? The mock outputs its input without encryption.
        expect(encryptService.decryptToUtf8).toBeCalledWith(encryptedToken, key);
      },
    );

    it.each([
      ["invalid length", "invalid length", "invalid"],
      ["all padding", "missing json object", `${"0".repeat(512)}`],
      [
        "invalid padding",
        "invalid padding",
        `{"token":"a token","wasPlainText":true} ${"0".repeat(472)}`,
      ],
      ["only closing brace", "invalid json", `}${"0".repeat(511)}`],
      ["token is NaN", "invalid json", `{"token":NaN}${"0".repeat(499)}`],
      ["only unknown key", "unknown keys", `{"unknown":"key"}${"0".repeat(495)}`],
      ["unknown key", "unknown keys", `{"token":"some token","unknown":"key"}${"0".repeat(474)}`],
      [
        "unknown key with wasPlainText",
        "unknown keys",
        `{"token":"some token","wasPlainText":true,"unknown":"key"}${"0".repeat(454)}`,
      ],
      ["empty json object", "invalid token", `{}${"0".repeat(510)}`],
      ["token is a number", "invalid token", `{"token":5}${"0".repeat(501)}`],
      [
        "wasPlainText is false",
        "invalid wasPlainText",
        `{"token":"foo","wasPlainText":false}${"0".repeat(476)}`,
      ],
      [
        "wasPlainText is string",
        "invalid wasPlainText",
        `{"token":"foo","wasPlainText":"fal"}${"0".repeat(476)}`,
      ],
    ])(
      "should delete untrusted encrypted values (description %s, reason: %s) ",
      async (_description, expectedReason, encryptedToken) => {
        const encryptService = mockEncryptService();

        // cast through unknown to avoid type errors; the mock doesn't need the real types
        // since it just outputs its input
        const key: SymmetricCryptoKey = "a key" as unknown as SymmetricCryptoKey;
        const options = { encryptedToken: encryptedToken as unknown as EncString };

        const reason = await decryptInPlace(encryptService, key, options);

        expect(options).not.toHaveProperty("encryptedToken");
        expect(reason).toEqual(expectedReason);
      },
    );
  });
});
