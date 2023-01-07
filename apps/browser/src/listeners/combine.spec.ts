import { combine } from "./combine";

describe("combine", () => {
  it("runs", () => {
    const combined = combine([
      (arg: Record<string, unknown>, serviceCache: Record<string, unknown>) => {
        arg["one"] = true;
        serviceCache["one"] = true;
      },
      (arg: Record<string, unknown>, serviceCache: Record<string, unknown>) => {
        if (serviceCache["one"] !== true) {
          throw new Error("One should have ran.");
        }
        arg["two"] = true;
      },
    ]);

    const arg: Record<string, unknown> = {};
    combined(arg);

    expect(arg["one"]).toBeTruthy();

    expect(arg["two"]).toBeTruthy();
  });
});
