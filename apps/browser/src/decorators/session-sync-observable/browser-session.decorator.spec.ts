import { BehaviorSubject } from "rxjs";

import { AbstractMemoryStorageService } from "@bitwarden/common/abstractions/storage.service";
import { MemoryStorageService } from "@bitwarden/common/services/memoryStorage.service";

import { BrowserStateService } from "../../services/browser-state.service";

import { browserSession } from "./browser-session.decorator";
import { SessionStorable } from "./session-storable";
import { sessionSync } from "./session-sync.decorator";

// browserSession initializes SessionSyncers for each sessionSync decorated property
// We don't want to test SessionSyncers, so we'll mock them
jest.mock("./session-syncer");

describe("browserSession decorator", () => {
  it("should throw if neither StateService nor MemoryStorageService is a constructor argument", () => {
    @browserSession
    class TestClass {}
    expect(() => {
      new TestClass();
    }).toThrowError(
      "Cannot decorate TestClass with browserSession, Browser's AbstractMemoryStorageService must be accessible through the observed classes parameters"
    );
  });

  it("should create if StateService is a constructor argument", () => {
    const stateService = Object.create(BrowserStateService.prototype, {
      memoryStorageService: {
        value: Object.create(MemoryStorageService.prototype, {
          type: { value: MemoryStorageService.TYPE },
        }),
      },
    });

    @browserSession
    class TestClass {
      constructor(private stateService: BrowserStateService) {}
    }

    expect(new TestClass(stateService)).toBeDefined();
  });

  it("should create if MemoryStorageService is a constructor argument", () => {
    const memoryStorageService = Object.create(MemoryStorageService.prototype, {
      type: { value: MemoryStorageService.TYPE },
    });

    @browserSession
    class TestClass {
      constructor(private memoryStorageService: AbstractMemoryStorageService) {}
    }

    expect(new TestClass(memoryStorageService)).toBeDefined();
  });

  describe("interaction with @sessionSync decorator", () => {
    let memoryStorageService: MemoryStorageService;

    @browserSession
    class TestClass {
      @sessionSync({ initializer: (s: string) => s })
      private behaviorSubject = new BehaviorSubject("");

      constructor(private memoryStorageService: MemoryStorageService) {}

      fromJSON(json: any) {
        this.behaviorSubject.next(json);
      }
    }

    beforeEach(() => {
      memoryStorageService = Object.create(MemoryStorageService.prototype, {
        type: { value: MemoryStorageService.TYPE },
      });
    });

    it("should create a session syncer", () => {
      const testClass = new TestClass(memoryStorageService) as any as SessionStorable;
      expect(testClass.__sessionSyncers.length).toEqual(1);
    });

    it("should initialize the session syncer", () => {
      const testClass = new TestClass(memoryStorageService) as any as SessionStorable;
      expect(testClass.__sessionSyncers[0].init).toHaveBeenCalled();
    });
  });
});
