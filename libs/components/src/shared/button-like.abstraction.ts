export type ButtonType = "primary" | "secondary" | "danger" | "unstyled";

export abstract class ButtonLikeAbstraction {
  loading: boolean;
  disabled: boolean;
  setButtonType: (value: ButtonType) => void;
}
