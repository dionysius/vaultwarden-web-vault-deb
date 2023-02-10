import AutofillField from "./autofill-field";
import AutofillForm from "./autofill-form";

/**
 * The details of a page that have been collected and can be used for autofill
 */
export default class AutofillPageDetails {
  /**
   * A unique identifier for the page
   */
  documentUUID: string;
  title: string;
  url: string;
  documentUrl: string;
  tabUrl: string;
  /**
   * A collection of all of the forms in the page DOM, keyed by their `opid`
   */
  forms: { [id: string]: AutofillForm };
  /**
   * A collection of all the fields in the page DOM, keyed by their `opid`
   */
  fields: AutofillField[];
  collectedTimestamp: number;
}
