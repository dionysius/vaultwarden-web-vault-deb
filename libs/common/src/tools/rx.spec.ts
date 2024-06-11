/**
 * include structuredClone in test environment.
 * @jest-environment ../../../../shared/test.environment.ts
 */
import { of, firstValueFrom } from "rxjs";

import { awaitAsync, trackEmissions } from "../../spec";

import { distinctIfShallowMatch, reduceCollection } from "./rx";

describe("reduceCollection", () => {
  it.each([[null], [undefined], [[]]])(
    "should return the default value when the collection is %p",
    async (value: number[]) => {
      const reduce = (acc: number, value: number) => acc + value;
      const source$ = of(value);

      const result$ = source$.pipe(reduceCollection(reduce, 100));
      const result = await firstValueFrom(result$);

      expect(result).toEqual(100);
    },
  );

  it("should reduce the collection to a single value", async () => {
    const reduce = (acc: number, value: number) => acc + value;
    const source$ = of([1, 2, 3]);

    const result$ = source$.pipe(reduceCollection(reduce, 0));
    const result = await firstValueFrom(result$);

    expect(result).toEqual(6);
  });
});

describe("distinctIfShallowMatch", () => {
  it("emits a single value", async () => {
    const source$ = of({ foo: true });
    const pipe$ = source$.pipe(distinctIfShallowMatch());

    const result = trackEmissions(pipe$);
    await awaitAsync();

    expect(result).toEqual([{ foo: true }]);
  });

  it("emits different values", async () => {
    const source$ = of({ foo: true }, { foo: false });
    const pipe$ = source$.pipe(distinctIfShallowMatch());

    const result = trackEmissions(pipe$);
    await awaitAsync();

    expect(result).toEqual([{ foo: true }, { foo: false }]);
  });

  it("emits new keys", async () => {
    const source$ = of({ foo: true }, { foo: true, bar: true });
    const pipe$ = source$.pipe(distinctIfShallowMatch());

    const result = trackEmissions(pipe$);
    await awaitAsync();

    expect(result).toEqual([{ foo: true }, { foo: true, bar: true }]);
  });

  it("suppresses identical values", async () => {
    const source$ = of({ foo: true }, { foo: true });
    const pipe$ = source$.pipe(distinctIfShallowMatch());

    const result = trackEmissions(pipe$);
    await awaitAsync();

    expect(result).toEqual([{ foo: true }]);
  });

  it("suppresses removed keys", async () => {
    const source$ = of({ foo: true, bar: true }, { foo: true });
    const pipe$ = source$.pipe(distinctIfShallowMatch());

    const result = trackEmissions(pipe$);
    await awaitAsync();

    expect(result).toEqual([{ foo: true, bar: true }]);
  });
});
