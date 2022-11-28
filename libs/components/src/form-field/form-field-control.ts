export abstract class BitFormFieldControl {
  ariaDescribedBy: string;
  id: string;
  labelForId: string;
  required: boolean;
  hasError: boolean;
  error: [string, any];
  type?: "text" | "password";
  spellcheck?: boolean;
  focus?: () => void;
}
