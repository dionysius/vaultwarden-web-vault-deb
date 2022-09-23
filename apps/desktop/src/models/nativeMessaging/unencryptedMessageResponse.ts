import { MessageCommon } from "./messageCommon";

export type UnencryptedMessageResponse = MessageCommon &
  (
    | {
        payload: {
          status: "success";
          sharedKey: string;
        };
      }
    | {
        payload: {
          error: "canceled" | "locked" | "cannot-decrypt" | "version-discrepancy";
        };
      }
  );
