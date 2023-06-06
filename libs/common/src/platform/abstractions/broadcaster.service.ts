export interface MessageBase {
  command: string;
}

/**
 * @deprecated Use the observable from the appropriate service instead.
 */
export abstract class BroadcasterService {
  /**
   * @deprecated Use the observable from the appropriate service instead.
   */
  send: (message: MessageBase, id?: string) => void;
  /**
   * @deprecated Use the observable from the appropriate service instead.
   */
  subscribe: (id: string, messageCallback: (message: MessageBase) => void) => void;
  /**
   * @deprecated Use the observable from the appropriate service instead.
   */
  unsubscribe: (id: string) => void;
}
