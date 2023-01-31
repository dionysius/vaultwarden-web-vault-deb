import AutofillField from "./autofill-field";
import AutofillForm from "./autofill-form";

export default class AutofillPageDetails {
  documentUUID: string;
  title: string;
  url: string;
  documentUrl: string;
  tabUrl: string;
  forms: { [id: string]: AutofillForm };
  fields: AutofillField[];
  collectedTimestamp: number;
}
