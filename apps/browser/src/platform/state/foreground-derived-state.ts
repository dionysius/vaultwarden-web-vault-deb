import { NgZone } from "@angular/core";
import {
  Observable,
  ReplaySubject,
  defer,
  filter,
  firstValueFrom,
  map,
  merge,
  of,
  share,
  switchMap,
  tap,
  timer,
} from "rxjs";
import { Jsonify, JsonObject } from "type-fest";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DeriveDefinition, DerivedState } from "@bitwarden/common/platform/state";
import { DerivedStateDependencies } from "@bitwarden/common/types/state";

import { fromChromeEvent } from "../browser/from-chrome-event";
import { runInsideAngular } from "../browser/run-inside-angular.operator";

export class ForegroundDerivedState<TTo> implements DerivedState<TTo> {
  private storageKey: string;
  private port: chrome.runtime.Port;
  private backgroundResponses$: Observable<DerivedStateMessage>;
  state$: Observable<TTo>;

  constructor(
    private deriveDefinition: DeriveDefinition<unknown, TTo, DerivedStateDependencies>,
    private memoryStorage: AbstractStorageService & ObservableStorageService,
    private portName: string,
    private ngZone: NgZone,
  ) {
    this.storageKey = deriveDefinition.storageKey;

    const initialStorageGet$ = defer(() => {
      return this.getStoredValue();
    }).pipe(
      filter((s) => s.derived),
      map((s) => s.value),
    );

    const latestStorage$ = this.memoryStorage.updates$.pipe(
      filter((s) => s.key === this.storageKey),
      switchMap(async (storageUpdate) => {
        if (storageUpdate.updateType === "remove") {
          return null;
        }

        return await this.getStoredValue();
      }),
      filter((s) => s.derived),
      map((s) => s.value),
    );

    this.state$ = defer(() => of(this.initializePort())).pipe(
      switchMap(() => merge(initialStorageGet$, latestStorage$)),
      share({
        connector: () => new ReplaySubject<TTo>(1),
        resetOnRefCountZero: () =>
          timer(this.deriveDefinition.cleanupDelayMs).pipe(tap(() => this.tearDownPort())),
      }),
      runInsideAngular(this.ngZone),
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

  private initializePort() {
    if (this.port != null) {
      return;
    }

    this.port = chrome.runtime.connect({ name: this.portName });

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

  private tearDownPort() {
    if (this.port == null) {
      return;
    }

    this.port.disconnect();
    this.port = null;
    this.backgroundResponses$ = null;
  }

  protected async getStoredValue(): Promise<{ derived: boolean; value: TTo | null }> {
    if (this.memoryStorage.valuesRequireDeserialization) {
      const storedJson = await this.memoryStorage.get<
        Jsonify<{ derived: true; value: JsonObject }>
      >(this.storageKey);

      if (!storedJson?.derived) {
        return { derived: false, value: null };
      }

      const value = this.deriveDefinition.deserialize(storedJson.value as any);

      return { derived: true, value };
    } else {
      const stored = await this.memoryStorage.get<{ derived: true; value: TTo }>(this.storageKey);

      if (!stored?.derived) {
        return { derived: false, value: null };
      }

      return { derived: true, value: stored.value };
    }
  }
}
