import { Fido2Utils } from "./fido2-utils";

describe("Fido2 Utils", () => {
  const asciiHelloWorldArray = [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100];
  const b64HelloWorldString = "aGVsbG8gd29ybGQ=";

  describe("fromBufferToB64(...)", () => {
    it("should convert an ArrayBuffer to a b64 string", () => {
      const buffer = new Uint8Array(asciiHelloWorldArray).buffer;
      const b64String = Fido2Utils.fromBufferToB64(buffer);
      expect(b64String).toBe(b64HelloWorldString);
    });

    it("should return an empty string when given an empty ArrayBuffer", () => {
      const buffer = new Uint8Array([]).buffer;
      const b64String = Fido2Utils.fromBufferToB64(buffer);
      expect(b64String).toBe("");
    });

    it("should return null when given null input", () => {
      const b64String = Fido2Utils.fromBufferToB64(null);
      expect(b64String).toBeNull();
    });
  });

  describe("fromB64ToArray(...)", () => {
    it("should convert a b64 string to an Uint8Array", () => {
      const expectedArray = new Uint8Array(asciiHelloWorldArray);

      const resultArray = Fido2Utils.fromB64ToArray(b64HelloWorldString);

      expect(resultArray).toEqual(expectedArray);
    });

    it("should return null when given null input", () => {
      const expectedArray = Fido2Utils.fromB64ToArray(null);
      expect(expectedArray).toBeNull();
    });
  });
});
