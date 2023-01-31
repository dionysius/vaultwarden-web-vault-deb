import { CipherType } from "../../vault/enums/cipher-type";
import { CardView } from "../../vault/models/view/card.view";
import { CipherView } from "../../vault/models/view/cipher.view";
import { IdentityView } from "../../vault/models/view/identity.view";
import { Importer } from "../importer";

import { IgnoredProperties, OnePasswordCsvImporter } from "./onepassword-csv-importer";

export class OnePasswordMacCsvImporter extends OnePasswordCsvImporter implements Importer {
  setCipherType(value: any, cipher: CipherView) {
    const onePassType = this.getValueOrDefault(this.getProp(value, "type"), "Login");
    switch (onePassType) {
      case "Credit Card":
        cipher.type = CipherType.Card;
        cipher.card = new CardView();
        IgnoredProperties.push("type");
        break;
      case "Identity":
        cipher.type = CipherType.Identity;
        cipher.identity = new IdentityView();
        IgnoredProperties.push("type");
        break;
      case "Login":
      case "Secure Note":
        IgnoredProperties.push("type");
        break;
      default:
        break;
    }
  }
}
