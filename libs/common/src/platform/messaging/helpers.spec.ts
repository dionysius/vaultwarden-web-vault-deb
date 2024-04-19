import { Subject, firstValueFrom } from "rxjs";

import { getCommand, isExternalMessage, tagAsExternal } from "./helpers";
import { Message, CommandDefinition } from "./types";

describe("helpers", () => {
  describe("getCommand", () => {
    it("can get the command from just a string", () => {
      const command = getCommand("myCommand");

      expect(command).toEqual("myCommand");
    });

    it("can get the command from a message definition", () => {
      const commandDefinition = new CommandDefinition<object>("myCommand");

      const command = getCommand(commandDefinition);

      expect(command).toEqual("myCommand");
    });
  });

  describe("tag integration", () => {
    it("can tag and identify as tagged", async () => {
      const messagesSubject = new Subject<Message<object>>();

      const taggedMessages = messagesSubject.asObservable().pipe(tagAsExternal);

      const firstValuePromise = firstValueFrom(taggedMessages);

      messagesSubject.next({ command: "test" });

      const result = await firstValuePromise;

      expect(isExternalMessage(result)).toEqual(true);
    });
  });

  describe("isExternalMessage", () => {
    it.each([null, { command: "myCommand", test: "object" }, undefined] as Message<
      Record<string, unknown>
    >[])("returns false when value is %s", (value: Message<object>) => {
      expect(isExternalMessage(value)).toBe(false);
    });
  });
});
