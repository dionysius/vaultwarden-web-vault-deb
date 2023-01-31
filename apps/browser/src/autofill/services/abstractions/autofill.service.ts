import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import AutofillField from "../../models/autofill-field";
import AutofillForm from "../../models/autofill-form";
import AutofillPageDetails from "../../models/autofill-page-details";

export interface PageDetail {
  frameId: number;
  tab: chrome.tabs.Tab;
  details: AutofillPageDetails;
}

export interface AutoFillOptions {
  cipher: CipherView;
  pageDetails: PageDetail[];
  doc?: typeof window.document;
  tab: chrome.tabs.Tab;
  skipUsernameOnlyFill?: boolean;
  onlyEmptyFields?: boolean;
  onlyVisibleFields?: boolean;
  fillNewPassword?: boolean;
  skipLastUsed?: boolean;
}

export interface FormData {
  form: AutofillForm;
  password: AutofillField;
  username: AutofillField;
  passwords: AutofillField[];
}

export abstract class AutofillService {
  getFormsWithPasswordFields: (pageDetails: AutofillPageDetails) => FormData[];
  doAutoFill: (options: AutoFillOptions) => Promise<string>;
  doAutoFillOnTab: (
    pageDetails: PageDetail[],
    tab: chrome.tabs.Tab,
    fromCommand: boolean
  ) => Promise<string>;
  doAutoFillActiveTab: (pageDetails: PageDetail[], fromCommand: boolean) => Promise<string>;
}
