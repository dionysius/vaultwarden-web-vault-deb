import { FirefoxCsvImporter as Importer } from "@bitwarden/common/importers/firefox-csv-importer";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";

import { data as firefoxAccountsData } from "./test-data/firefox-csv/firefox-accounts-data.csv";
import { data as simplePasswordData } from "./test-data/firefox-csv/simple-password-data.csv";

const CipherData = [
  {
    title: "should parse password",
    csv: simplePasswordData,
    expected: Object.assign(new CipherView(), {
      id: null,
      organizationId: null,
      folderId: null,
      name: "example.com",
      login: Object.assign(new LoginView(), {
        username: "foo",
        password: "bar",
        uris: [
          Object.assign(new LoginUriView(), {
            uri: "https://example.com",
          }),
        ],
      }),
      notes: null,
      type: 1,
    }),
  },
  {
    title: 'should skip "chrome://FirefoxAccounts"',
    csv: firefoxAccountsData,
    expected: Object.assign(new CipherView(), {
      id: null,
      organizationId: null,
      folderId: null,
      name: "example.com",
      login: Object.assign(new LoginView(), {
        username: "foo",
        password: "bar",
        uris: [
          Object.assign(new LoginUriView(), {
            uri: "https://example.com",
          }),
        ],
      }),
      notes: null,
      type: 1,
    }),
  },
];

describe("Firefox CSV Importer", () => {
  CipherData.forEach((data) => {
    it(data.title, async () => {
      const importer = new Importer();
      const result = await importer.parse(data.csv);
      expect(result != null).toBe(true);
      expect(result.ciphers.length).toBeGreaterThan(0);

      const cipher = result.ciphers.shift();
      let property: keyof typeof data.expected;
      for (property in data.expected) {
        // eslint-disable-next-line
        if (data.expected.hasOwnProperty(property)) {
          // eslint-disable-next-line
          expect(cipher.hasOwnProperty(property)).toBe(true);
          expect(cipher[property]).toEqual(data.expected[property]);
        }
      }
    });
  });
});
