import {
  EnvironmentServerConfigData,
  ServerConfigData,
  ThirdPartyServerConfigData,
} from "./server-config.data";

describe("ServerConfigData", () => {
  describe("fromJSON", () => {
    it("should create a ServerConfigData from a JSON object", () => {
      const serverConfigData = ServerConfigData.fromJSON({
        version: "1.0.0",
        gitHash: "1234567890",
        server: {
          name: "test",
          url: "https://test.com",
        },
        environment: {
          vault: "https://vault.com",
          api: "https://api.com",
          identity: "https://identity.com",
          notifications: "https://notifications.com",
          sso: "https://sso.com",
        },
        utcDate: "2020-01-01T00:00:00.000Z",
      });

      expect(serverConfigData.version).toEqual("1.0.0");
      expect(serverConfigData.gitHash).toEqual("1234567890");
      expect(serverConfigData.server.name).toEqual("test");
      expect(serverConfigData.server.url).toEqual("https://test.com");
      expect(serverConfigData.environment.vault).toEqual("https://vault.com");
      expect(serverConfigData.environment.api).toEqual("https://api.com");
      expect(serverConfigData.environment.identity).toEqual("https://identity.com");
      expect(serverConfigData.environment.notifications).toEqual("https://notifications.com");
      expect(serverConfigData.environment.sso).toEqual("https://sso.com");
      expect(serverConfigData.utcDate).toEqual("2020-01-01T00:00:00.000Z");
    });

    it("should be an instance of ServerConfigData", () => {
      const serverConfigData = ServerConfigData.fromJSON({} as any);

      expect(serverConfigData).toBeInstanceOf(ServerConfigData);
    });

    it("should deserialize sub objects", () => {
      const serverConfigData = ServerConfigData.fromJSON({
        server: {},
        environment: {},
      } as any);

      expect(serverConfigData.server).toBeInstanceOf(ThirdPartyServerConfigData);
      expect(serverConfigData.environment).toBeInstanceOf(EnvironmentServerConfigData);
    });
  });
});
