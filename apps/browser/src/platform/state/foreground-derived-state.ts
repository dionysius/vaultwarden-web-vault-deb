import {
  Observable,
  ReplaySubject,
  defer,
  filter,
  firstValueFrom,
  map,
  share,
  tap,
  timer,
} from "rxjs";

import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DeriveDefinition, DerivedState } from "@bitwarden/common/platform/state";
import { DerivedStateDependencies } from "@bitwarden/common/types/state";

import { fromChromeEvent } from "../browser/from-chrome-event";

export class ForegroundDerivedState<TTo> implements DerivedState<TTo> {
  private port: chrome.runtime.Port;
  // For testing purposes
  private replaySubject: ReplaySubject<TTo>;
  private backgroundResponses$: Observable<DerivedStateMessage>;
  state$: Observable<TTo>;

  constructor(private deriveDefinition: DeriveDefinition<unknown, TTo, DerivedStateDependencies>) {
    this.state$ = defer(() => this.initializePort()).pipe(
      filter((message) => message.action === "nextState"),
      map((message) => this.hydrateNext(message.data)),
      share({
        connector: () => {
          this.replaySubject = new ReplaySubject<TTo>(1);
          return this.replaySubject;
        },
        resetOnRefCountZero: () =>
          timer(this.deriveDefinition.cleanupDelayMs).pipe(tap(() => this.tearDown())),
      }),
    );
  }

  async forceValue(value: TTo): Promise<TTo> {
    let cleanPort = false;
    if (this.port == null) {
      this.initializePort();
      cleanPort = true;
    }
    await this.delegateToBackground("nextState", value);
    if (cleanPort) {
      this.tearDownPort();
    }
    return value;
  }

  private initializePort(): Observable<DerivedStateMessage> {
    if (this.port != null) {
      return;
    }

    this.port = chrome.runtime.connect({ name: this.deriveDefinition.buildCacheKey() });

    this.backgroundResponses$ = fromChromeEvent(this.port.onMessage).pipe(
      map(([message]) => message as DerivedStateMessage),
      filter((message) => message.originator === "background"),
    );
    return this.backgroundResponses$;
  }

  private async delegateToBackground(action: DerivedStateActions, data: TTo): Promise<void> {
    const id = Utils.newGuid();
    // listen for response before request
    const response = firstValueFrom(
      this.backgroundResponses$.pipe(filter((message) => message.id === id)),
    );

    this.sendMessage({
      id,
      action,
      data: JSON.stringify(data),
    });

    await response;
  }

  private sendMessage(message: Omit<DerivedStateMessage, "originator">) {
    this.port.postMessage({
      ...message,
      originator: "foreground",
    });
  }

  private hydrateNext(value: string): TTo {
    const jsonObj = JSON.parse(value);
    return this.deriveDefinition.deserialize(jsonObj);
  }

  private tearDownPort() {
    if (this.port == null) {
      return;
    }

    this.port.disconnect();
    this.port = null;
    this.backgroundResponses$ = null;
  }

  private tearDown() {
    this.tearDownPort();
    this.replaySubject.complete();
  }
}
