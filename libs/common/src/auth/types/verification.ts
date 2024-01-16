import { VerificationType } from "../enums/verification-type";

export type OtpVerification = { type: VerificationType.OTP; secret: string };
export type MasterPasswordVerification = { type: VerificationType.MasterPassword; secret: string };
export type PinVerification = { type: VerificationType.PIN; secret: string };
export type BiometricsVerification = { type: VerificationType.Biometrics };

export type VerificationWithSecret = OtpVerification | MasterPasswordVerification | PinVerification;
export type VerificationWithoutSecret = BiometricsVerification;

export type Verification = VerificationWithSecret | VerificationWithoutSecret;

export function verificationHasSecret(
  verification: Verification,
): verification is VerificationWithSecret {
  return "secret" in verification;
}

export type ServerSideVerification = OtpVerification | MasterPasswordVerification;
