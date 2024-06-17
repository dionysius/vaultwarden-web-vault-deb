import AutofillField from "../../models/autofill-field";
import AutofillPageDetails from "../../models/autofill-page-details";

export interface InlineMenuFieldQualificationsService {
  isFieldForLoginForm(field: AutofillField, pageDetails: AutofillPageDetails): boolean;
}
