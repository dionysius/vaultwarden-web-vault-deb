import { VerificationType } from "../auth/enums/verification-type";

export type Verification = {
  type: VerificationType;
  secret: string;
};
