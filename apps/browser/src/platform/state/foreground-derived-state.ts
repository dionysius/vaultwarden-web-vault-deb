import { NgZone } from "@angular/core";
import {
  Observable,
  ReplaySubject,
  defer,
  filter,
  firstValueFrom,
  map,
  of,
  share,
  switchMap,
  tap,
  timer,
} from "rxjs";
import { Jsonify } from "type-fest";

import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DeriveDefinition, DerivedState } from "@bitwarden/common/platform/state";
import { DerivedStateDependencies } from "@bitwarden/common/types/state";

import { fromChromeEvent } from "../browser/from-chrome-event";
import { runInsideAngular } from "../browser/run-inside-angular.operator";

export class ForegroundDerivedState<TTo> implements DerivedState<TTo> {
  private port: chrome.runtime.Port;
  private backgroundResponses$: Observable<DerivedStateMessage>;
  state$: Observable<TTo>;

  constructor(
    private deriveDefinition: DeriveDefinition<unknown, TTo, DerivedStateDependencies>,
    private portName: string,
    private ngZone: NgZone,
  ) {
    const latestValueFromPort$ = (port: chrome.runtime.Port) => {
      return fromChromeEvent(port.onMessage).pipe(
        map(([message]) => message as DerivedStateMessage),
        filter((message) => message.originator === "background" && message.action === "nextState"),
        map((message) => {
          const json = JSON.parse(message.data) as Jsonify<TTo>;
          return this.deriveDefinition.deserialize(json);
        }),
      );
    };

    this.state$ = defer(() => of(this.initializePort())).pipe(
      switchMap(() => latestValueFromPort$(this.port)),
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
}
