import { BehaviorSubject } from "rxjs";

import { StateService } from "../../services/state.service";

import { browserSession } from "./browser-session.decorator";
import { SessionStorable } from "./session-storable";
import { sessionSync } from "./session-sync.decorator";

// browserSession initializes SessionSyncers for each sessionSync decorated property
// We don't want to test SessionSyncers, so we'll mock them
jest.mock("./session-syncer");

describe("browserSession decorator", () => {
  it("should throw if StateService is not a constructor argument", () => {
    @browserSession
    class TestClass {}
    expect(() => {
      new TestClass();
    }).toThrowError(
      "Cannot decorate TestClass with browserSession, Browser's StateService must be injected"
    );
  });

  it("should create if StateService is a constructor argument", () => {
    const stateService = Object.create(StateService.prototype, {});

    @browserSession
    class TestClass {
      constructor(private stateService: StateService) {}
    }

    expect(new TestClass(stateService)).toBeDefined();
  });

  describe("interaction with @sessionSync decorator", () => {
    let stateService: StateService;

    @browserSession
    class TestClass {
      @sessionSync({ initializer: (s: string) => s })
      behaviorSubject = new BehaviorSubject("");

      constructor(private stateService: StateService) {}

      fromJSON(json: any) {
        this.behaviorSubject.next(json);
      }
    }

    beforeEach(() => {
      stateService = Object.create(StateService.prototype, {}) as StateService;
    });

    it("should create a session syncer", () => {
      const testClass = new TestClass(stateService) as any as SessionStorable;
      expect(testClass.__sessionSyncers.length).toEqual(1);
    });

    it("should initialize the session syncer", () => {
      const testClass = new TestClass(stateService) as any as SessionStorable;
      expect(testClass.__sessionSyncers[0].init).toHaveBeenCalled();
    });
  });
});
