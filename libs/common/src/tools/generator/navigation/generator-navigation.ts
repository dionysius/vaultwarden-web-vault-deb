import { GeneratorType } from "../generator-type";
import { ForwarderId } from "../username/options";
import { UsernameGeneratorType } from "../username/options/generator-options";

/** Stores credential generator UI state. */

export type GeneratorNavigation = {
  /** The kind of credential being generated.
   * @remarks The legacy generator only supports "password" and "passphrase".
   *  The componentized generator supports all values.
   */
  type?: GeneratorType;

  /** When `type === "username"`, this stores the username algorithm. */
  username?: UsernameGeneratorType;

  /** When `username === "forwarded"`, this stores the forwarder implementation. */
  forwarder?: ForwarderId | "";
};
/** The default options for password generation. */

export const DefaultGeneratorNavigation: Partial<GeneratorNavigation> = Object.freeze({
  type: "password",
  username: "word",
  forwarder: "",
});
