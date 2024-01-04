import { Observable, Subject, Subscription } from "rxjs";
import { Jsonify } from "type-fest";

import {
  AbstractStorageService,
  ObservableStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { DeriveDefinition } from "@bitwarden/common/platform/state";
// eslint-disable-next-line import/no-restricted-paths -- extending this class for this client
import { DefaultDerivedState } from "@bitwarden/common/platform/state/implementations/default-derived-state";
import { ShapeToInstances, Type } from "@bitwarden/common/types/state";

import { BrowserApi } from "../browser/browser-api";

export class BackgroundDerivedState<
  TFrom,
  TTo,
  TDeps extends Record<string, Type<unknown>>,
> extends DefaultDerivedState<TFrom, TTo, TDeps> {
  private portSubscriptions: Map<
    chrome.runtime.Port,
    { subscription: Subscription; delaySubject: Subject<void> }
  > = new Map();

  constructor(
    parentState$: Observable<TFrom>,
    deriveDefinition: DeriveDefinition<TFrom, TTo, TDeps>,
    memoryStorage: AbstractStorageService & ObservableStorageService,
    dependencies: ShapeToInstances<TDeps>,
  ) {
    super(parentState$, deriveDefinition, memoryStorage, dependencies);
    const portName = deriveDefinition.buildCacheKey();

    // listen for foreground derived states to connect
    BrowserApi.addListener(chrome.runtime.onConnect, (port) => {
      if (port.name !== portName) {
        return;
      }

      const listenerCallback = this.onMessageFromForeground.bind(this);
      port.onDisconnect.addListener(() => {
        const { subscription, delaySubject } = this.portSubscriptions.get(port) ?? {
          subscription: null,
          delaySubject: null,
        };
        subscription?.unsubscribe();
        delaySubject?.complete();
        this.portSubscriptions.delete(port);
        port.onMessage.removeListener(listenerCallback);
      });
      port.onMessage.addListener(listenerCallback);

      const delaySubject = new Subject<void>();
      const stateSubscription = this.state$.subscribe((state) => {
        // delay to allow the foreground to connect. This may just be needed for testing
        setTimeout(() => {
          this.sendNewMessage(
            {
              action: "nextState",
              data: JSON.stringify(state),
            },
            port,
          );
        }, 0);
      });

      this.portSubscriptions.set(port, { subscription: stateSubscription, delaySubject });
    });
  }

  private async onMessageFromForeground(message: DerivedStateMessage, port: chrome.runtime.Port) {
    if (message.originator === "background") {
      return;
    }

    switch (message.action) {
      case "nextState": {
        const dataObj = JSON.parse(message.data) as Jsonify<TTo>;
        const data = this.deriveDefinition.deserialize(dataObj);
        await this.forceValue(data);
        await this.sendResponse(
          message,
          {
            action: "resolve",
          },
          port,
        );
        break;
      }
    }
  }

  private async sendNewMessage(
    message: Omit<DerivedStateMessage, "originator" | "id">,
    port: chrome.runtime.Port,
  ) {
    const id = Utils.newGuid();
    this.sendMessage(
      {
        ...message,
        id: id,
      },
      port,
    );
  }

  private async sendResponse(
    originalMessage: DerivedStateMessage,
    response: Omit<DerivedStateMessage, "originator" | "id">,
    port: chrome.runtime.Port,
  ) {
    this.sendMessage(
      {
        ...response,
        id: originalMessage.id,
      },
      port,
    );
  }

  private async sendMessage(
    message: Omit<DerivedStateMessage, "originator">,
    port: chrome.runtime.Port,
  ) {
    port.postMessage({
      ...message,
      originator: "background",
    });
  }
}
