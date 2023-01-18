import { KeeperCsvImporter as Importer } from "@bitwarden/common/importers/keeper/keeper-csv-importer";

import { testData as TestData } from "./test-data/keeper-csv/testdata.csv";

describe("Keeper CSV Importer", () => {
  let importer: Importer;
  beforeEach(() => {
    importer = new Importer();
  });

  it("should parse login data", async () => {
    const result = await importer.parse(TestData);
    expect(result != null).toBe(true);

    const cipher = result.ciphers.shift();
    expect(cipher.name).toEqual("Bar");
    expect(cipher.login.username).toEqual("john.doe@example.com");
    expect(cipher.login.password).toEqual("1234567890abcdef");
    expect(cipher.login.uris.length).toEqual(1);
    const uriView = cipher.login.uris.shift();
    expect(uriView.uri).toEqual("https://example.com/");
    expect(cipher.notes).toEqual("These are some notes.");

    const cipher2 = result.ciphers.shift();
    expect(cipher2.name).toEqual("Bar 1");
    expect(cipher2.login.username).toEqual("john.doe1@example.com");
    expect(cipher2.login.password).toEqual("234567890abcdef1");
    expect(cipher2.login.uris.length).toEqual(1);
    const uriView2 = cipher2.login.uris.shift();
    expect(uriView2.uri).toEqual("https://an.example.com/");
    expect(cipher2.notes).toBeNull();

    const cipher3 = result.ciphers.shift();
    expect(cipher3.name).toEqual("Bar 2");
    expect(cipher3.login.username).toEqual("john.doe2@example.com");
    expect(cipher3.login.password).toEqual("34567890abcdef12");
    expect(cipher3.notes).toBeNull();
    expect(cipher3.login.uris.length).toEqual(1);
    const uriView3 = cipher3.login.uris.shift();
    expect(uriView3.uri).toEqual("https://another.example.com/");
  });

  it("should import TOTP when present", async () => {
    const result = await importer.parse(TestData);
    expect(result != null).toBe(true);

    const cipher = result.ciphers.shift();
    expect(cipher.login.totp).toBeNull();

    const cipher2 = result.ciphers.shift();
    expect(cipher2.login.totp).toBeNull();

    const cipher3 = result.ciphers.shift();
    expect(cipher3.login.totp).toEqual(
      "otpauth://totp/Amazon:me@company.com?secret=JBSWY3DPEHPK3PXP&issuer=Amazon&algorithm=SHA1&digits=6&period=30"
    );
  });

  it("should parse custom fields", async () => {
    const result = await importer.parse(TestData);
    expect(result != null).toBe(true);

    const cipher = result.ciphers.shift();
    expect(cipher.fields).toBeNull();

    const cipher2 = result.ciphers.shift();
    expect(cipher2.fields.length).toBe(2);
    expect(cipher2.fields[0].name).toEqual("Account ID");
    expect(cipher2.fields[0].value).toEqual("12345");
    expect(cipher2.fields[1].name).toEqual("Org ID");
    expect(cipher2.fields[1].value).toEqual("54321");

    const cipher3 = result.ciphers.shift();
    expect(cipher3.fields[0].name).toEqual("Account ID");
    expect(cipher3.fields[0].value).toEqual("23456");
  });
});
