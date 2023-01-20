import { combine } from "./combine";

describe("combine", () => {
  it("runs", async () => {
    const combined = combine([
      (arg: Record<string, unknown>, serviceCache: Record<string, unknown>) => {
        arg["one"] = true;
        serviceCache["one"] = true;
        return Promise.resolve();
      },
      (arg: Record<string, unknown>, serviceCache: Record<string, unknown>) => {
        if (serviceCache["one"] !== true) {
          throw new Error("One should have ran.");
        }
        arg["two"] = true;
        return Promise.resolve();
      },
    ]);

    const arg: Record<string, unknown> = {};
    await combined(arg);

    expect(arg["one"]).toBeTruthy();

    expect(arg["two"]).toBeTruthy();
  });
});
