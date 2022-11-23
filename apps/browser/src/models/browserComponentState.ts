import { Jsonify } from "type-fest";

export class BrowserComponentState {
  scrollY: number;
  searchText: string;

  static fromJSON(json: Jsonify<BrowserComponentState>) {
    if (json == null) {
      return null;
    }

    return Object.assign(new BrowserComponentState(), json);
  }
}
