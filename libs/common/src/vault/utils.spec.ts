import { CardView } from "@bitwarden/common/vault/models/view/card.view";
import { normalizeExpiryYearFormat, isCardExpired } from "@bitwarden/common/vault/utils";

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

function getCardExpiryDateValues() {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();

  // `Date` months are zero-indexed, our expiry date month inputs are one-indexed
  const currentMonth = currentDate.getMonth() + 1;

  return [
    [null, null, false], // no month, no year
    [undefined, undefined, false], // no month, no year, invalid values
    ["", "", false], // no month, no year, invalid values
    ["12", "agdredg42grg35grrr. ea3534@#^145345ag$%^  -_#$rdg ", false], // invalid values
    ["0", `${currentYear - 1}`, true], // invalid 0 month
    ["00", `${currentYear + 1}`, false], // invalid 0 month
    [`${currentMonth}`, "0000", true], // current month, in the year 2000
    [null, `${currentYear}`.slice(-2), false], // no month, this year
    [null, `${currentYear - 1}`.slice(-2), true], // no month, last year
    ["1", null, false], // no year, January
    ["1", `${currentYear - 1}`, true], // January last year
    ["13", `${currentYear}`, false], // 12 + 1 is Feb. in the next year (Date is zero-indexed)
    [`${currentMonth + 36}`, `${currentYear - 1}`, true], // even though the month value would put the date 3 years into the future when calculated with `Date`, an explicit year in the past indicates the card is expired
    [`${currentMonth}`, `${currentYear}`, false], // this year, this month (not expired until the month is over)
    [`${currentMonth}`, `${currentYear}`.slice(-2), false], // This month, this year (not expired until the month is over)
    [`${currentMonth - 1}`, `${currentYear}`, true], // last month
    [`${currentMonth - 1}`, `${currentYear + 1}`, false], // 11 months from now
  ];
}

describe("isCardExpired", () => {
  const expiryYearValueFormats = getCardExpiryDateValues();

  expiryYearValueFormats.forEach(
    ([inputMonth, inputYear, expectedValue]: [string | null, string | null, boolean]) => {
      it(`should return ${expectedValue} when the card expiry month is ${inputMonth} and the card expiry year is ${inputYear}`, () => {
        const testCardView = new CardView();
        testCardView.expMonth = inputMonth;
        testCardView.expYear = inputYear;

        const cardIsExpired = isCardExpired(testCardView);

        expect(cardIsExpired).toBe(expectedValue);
      });
    },
  );
});
