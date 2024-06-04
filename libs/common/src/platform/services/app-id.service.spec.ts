import { FakeGlobalState, FakeGlobalStateProvider, ObservableTracker } from "../../../spec";
import { Utils } from "../misc/utils";

import { ANONYMOUS_APP_ID_KEY, APP_ID_KEY, AppIdService } from "./app-id.service";

describe("AppIdService", () => {
  let globalStateProvider: FakeGlobalStateProvider;
  let appIdState: FakeGlobalState<string>;
  let anonymousAppIdState: FakeGlobalState<string>;
  let sut: AppIdService;

  beforeEach(() => {
    globalStateProvider = new FakeGlobalStateProvider();
    appIdState = globalStateProvider.getFake(APP_ID_KEY);
    anonymousAppIdState = globalStateProvider.getFake(ANONYMOUS_APP_ID_KEY);
    sut = new AppIdService(globalStateProvider);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getAppId", () => {
    it("returns the existing appId when it exists", async () => {
      appIdState.stateSubject.next("existingAppId");

      const appId = await sut.getAppId();

      expect(appId).toBe("existingAppId");
    });

    it("creates a new appId only once", async () => {
      appIdState.stateSubject.next(null);

      const appIds: string[] = [];
      const promises = [async () => appIds.push(await sut.getAppId())];
      promises.push(async () => appIds.push(await sut.getAppId()));
      await Promise.all(promises);

      expect(appIds[0]).toBe(appIds[1]);
    });

    it.each([null, undefined])("returns a new appId when %s", async (value) => {
      appIdState.stateSubject.next(value);

      const appId = await sut.getAppId();

      expect(appId).toMatch(Utils.guidRegex);
    });

    it.each([null, undefined])("stores the new guid when %s", async (value) => {
      appIdState.stateSubject.next(value);

      const appId = await sut.getAppId();

      expect(appIdState.nextMock).toHaveBeenCalledWith(appId);
    });

    it("emits only once when creating a new appId", async () => {
      appIdState.stateSubject.next(null);

      const tracker = new ObservableTracker(sut.appId$);
      const appId = await sut.getAppId();

      expect(tracker.emissions).toEqual([appId]);
      await expect(tracker.pauseUntilReceived(2, 50)).rejects.toThrow("Timeout exceeded");
    });
  });

  describe("getAnonymousAppId", () => {
    it("returns the existing appId when it exists", async () => {
      anonymousAppIdState.stateSubject.next("existingAppId");

      const appId = await sut.getAnonymousAppId();

      expect(appId).toBe("existingAppId");
    });

    it("creates a new anonymousAppId only once", async () => {
      anonymousAppIdState.stateSubject.next(null);

      const appIds: string[] = [];
      const promises = [async () => appIds.push(await sut.getAnonymousAppId())];
      promises.push(async () => appIds.push(await sut.getAnonymousAppId()));
      await Promise.all(promises);

      expect(appIds[0]).toBe(appIds[1]);
    });

    it.each([null, undefined])("returns a new appId when it does not exist", async (value) => {
      anonymousAppIdState.stateSubject.next(value);

      const appId = await sut.getAnonymousAppId();

      expect(appId).toMatch(Utils.guidRegex);
    });

    it.each([null, undefined])(
      "stores the new guid when it an existing one is not found",
      async (value) => {
        anonymousAppIdState.stateSubject.next(value);

        const appId = await sut.getAnonymousAppId();

        expect(anonymousAppIdState.nextMock).toHaveBeenCalledWith(appId);
      },
    );

    it("emits only once when creating a new anonymousAppId", async () => {
      anonymousAppIdState.stateSubject.next(null);

      const tracker = new ObservableTracker(sut.anonymousAppId$);
      const appId = await sut.getAnonymousAppId();

      expect(tracker.emissions).toEqual([appId]);
      await expect(tracker.pauseUntilReceived(2, 50)).rejects.toThrow("Timeout exceeded");
    });
  });
});
