export abstract class BitFormFieldControl {
  ariaDescribedBy: string;
  id: string;
  labelForId: string;
  required: boolean;
  hasError: boolean;
  error: [string, any];
}
