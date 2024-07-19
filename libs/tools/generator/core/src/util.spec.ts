import { sum } from "./util";

describe("sum", () => {
  it("returns 0 when the list is empty", () => {
    expect(sum()).toBe(0);
  });

  it("returns its argument when there's a single number", () => {
    expect(sum(1)).toBe(1);
  });

  it("adds its arguments together", () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(1, 3)).toBe(4);
    expect(sum(1, 2, 3)).toBe(6);
  });
});
