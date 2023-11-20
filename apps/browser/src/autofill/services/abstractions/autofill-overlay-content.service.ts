import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import AutofillField from "../../models/autofill-field";
import { ElementWithOpId, FormFieldElement } from "../../types";

type OpenAutofillOverlayOptions = {
  isFocusingFieldElement?: boolean;
  isOpeningFullOverlay?: boolean;
  authStatus?: AuthenticationStatus;
};

interface AutofillOverlayContentService {
  isFieldCurrentlyFocused: boolean;
  isCurrentlyFilling: boolean;
  isOverlayCiphersPopulated: boolean;
  pageDetailsUpdateRequired: boolean;
  init(): void;
  setupAutofillOverlayListenerOnField(
    autofillFieldElement: ElementWithOpId<FormFieldElement>,
    autofillFieldData: AutofillField
  ): Promise<void>;
  openAutofillOverlay(options: OpenAutofillOverlayOptions): void;
  removeAutofillOverlay(): void;
  removeAutofillOverlayButton(): void;
  removeAutofillOverlayList(): void;
  addNewVaultItem(): void;
  redirectOverlayFocusOut(direction: "previous" | "next"): void;
  focusMostRecentOverlayField(): void;
  blurMostRecentOverlayField(): void;
}

export { OpenAutofillOverlayOptions, AutofillOverlayContentService };
