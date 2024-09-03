import { normalizeExpiryYearFormat } from "@bitwarden/common/vault/utils";

function getExpiryYearValueFormats(currentCentury: string) {
  return [
    [-12, `${currentCentury}12`],
    [0, `${currentCentury}00`],
    [2043, "2043"], // valid year with a length of four should be taken directly
    [24, `${currentCentury}24`],
    [3054, "3054"], // valid year with a length of four should be taken directly
    [31423524543, `${currentCentury}43`],
    [4, `${currentCentury}04`],
    [null, null],
    [undefined, null],
    ["-12", `${currentCentury}12`],
    ["", null],
    ["0", `${currentCentury}00`],
    ["00", `${currentCentury}00`],
    ["000", `${currentCentury}00`],
    ["0000", `${currentCentury}00`],
    ["00000", `${currentCentury}00`],
    ["0234234", `${currentCentury}34`],
    ["04", `${currentCentury}04`],
    ["2043", "2043"], // valid year with a length of four should be taken directly
    ["24", `${currentCentury}24`],
    ["3054", "3054"], // valid year with a length of four should be taken directly
    ["31423524543", `${currentCentury}43`],
    ["4", `${currentCentury}04`],
    ["aaaa", null],
    ["adgshsfhjsdrtyhsrth", null],
    ["agdredg42grg35grrr. ea3534@#^145345ag$%^  -_#$rdg ", `${currentCentury}45`],
  ];
}

describe("normalizeExpiryYearFormat", () => {
  const currentCentury = `${new Date().getFullYear()}`.slice(0, 2);

  const expiryYearValueFormats = getExpiryYearValueFormats(currentCentury);

  expiryYearValueFormats.forEach(([inputValue, expectedValue]) => {
    it(`should return '${expectedValue}' when '${inputValue}' is passed`, () => {
      const formattedValue = normalizeExpiryYearFormat(inputValue);

      expect(formattedValue).toEqual(expectedValue);
    });
  });

  describe("in the year 3107", () => {
    const theDistantFuture = new Date(Date.UTC(3107, 1, 1));
    jest.spyOn(Date, "now").mockReturnValue(theDistantFuture.valueOf());

    beforeAll(() => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(theDistantFuture);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    const currentCentury = `${new Date(Date.now()).getFullYear()}`.slice(0, 2);
    expect(currentCentury).toBe("31");

    const expiryYearValueFormats = getExpiryYearValueFormats(currentCentury);

    expiryYearValueFormats.forEach(([inputValue, expectedValue]) => {
      it(`should return '${expectedValue}' when '${inputValue}' is passed`, () => {
        const formattedValue = normalizeExpiryYearFormat(inputValue);

        expect(formattedValue).toEqual(expectedValue);
      });
    });
    jest.clearAllTimers();
  });
});
