import { filter } from "rxjs";

export type SyncStatus = "Started" | "SuccessfullyCompleted" | "UnsuccessfullyCompleted";

export type SyncEventArgs = {
  status: SyncStatus;
};

/**
 * Helper function to filter only on successfully completed syncs
 * @returns a function that can be used in a `.pipe()` from an observable
 */
export function onlySuccessfullyCompleted() {
  return filter<SyncEventArgs>((syncEvent) => syncEvent.status === "SuccessfullyCompleted");
}
