import { VerificationType } from "../enums/verification-type";

export type Verification = {
  type: VerificationType;
  secret: string;
};
