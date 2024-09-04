import { CardView } from "@bitwarden/common/vault/models/view/card.view";

type NonZeroIntegers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Year = `${NonZeroIntegers}${NonZeroIntegers}${0 | NonZeroIntegers}${0 | NonZeroIntegers}`;

/**
 * Takes a string or number value and returns a string value formatted as a valid 4-digit year
 *
 * @export
 * @param {(string | number)} yearInput
 * @return {*}  {(Year | null)}
 */
export function normalizeExpiryYearFormat(yearInput: string | number): Year | null {
  // The input[type="number"] is returning a number, convert it to a string
  // An empty field returns null, avoid casting `"null"` to a string
  const yearInputIsEmpty = yearInput == null || yearInput === "";
  let expirationYear = yearInputIsEmpty ? null : `${yearInput}`;

  // Exit early if year is already formatted correctly or empty
  if (yearInputIsEmpty || /^[1-9]{1}\d{3}$/.test(expirationYear)) {
    return expirationYear as Year;
  }

  expirationYear = expirationYear
    // For safety, because even input[type="number"] will allow decimals
    .replace(/[^\d]/g, "")
    // remove any leading zero padding (leave the last leading zero if it ends the string)
    .replace(/^[0]+(?=.)/, "");

  if (expirationYear === "") {
    expirationYear = null;
  }

  // given the context of payment card expiry, a year character length of 3, or over 4
  // is more likely to be a mistake than an intentional value for the far past or far future.
  if (expirationYear && expirationYear.length !== 4) {
    const paddedYear = ("00" + expirationYear).slice(-2);
    const currentCentury = `${new Date().getFullYear()}`.slice(0, 2);

    expirationYear = currentCentury + paddedYear;
  }

  return expirationYear as Year | null;
}

/**
 * Takes a cipher card view and returns "true" if the month and year affirmativey indicate
 * the card is expired.
 *
 * @export
 * @param {CardView} cipherCard
 * @return {*}  {boolean}
 */
export function isCardExpired(cipherCard: CardView): boolean {
  if (cipherCard) {
    const { expMonth = null, expYear = null } = cipherCard;

    const now = new Date();
    const normalizedYear = normalizeExpiryYearFormat(expYear);

    // If the card year is before the current year, don't bother checking the month
    if (normalizedYear && parseInt(normalizedYear) < now.getFullYear()) {
      return true;
    }

    if (normalizedYear && expMonth) {
      // `Date` months are zero-indexed
      const parsedMonth =
        parseInt(expMonth) - 1 ||
        // Add a month floor of 0 to protect against an invalid low month value of "0"
        0;

      const parsedYear = parseInt(normalizedYear);

      // First day of the next month minus one, to get last day of the card month
      const cardExpiry = new Date(parsedYear, parsedMonth + 1, 0);

      return cardExpiry < now;
    }
  }

  return false;
}
