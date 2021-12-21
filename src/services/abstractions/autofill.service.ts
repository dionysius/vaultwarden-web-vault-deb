import AutofillPageDetails from "../../models/autofillPageDetails";

export abstract class AutofillService {
  getFormsWithPasswordFields: (pageDetails: AutofillPageDetails) => any[];
  doAutoFill: (options: any) => Promise<string>;
  doAutoFillActiveTab: (pageDetails: any, fromCommand: boolean) => Promise<string>;
}
