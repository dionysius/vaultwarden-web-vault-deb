export enum ForceResetPasswordReason {
  /**
   * A password reset should not be forced.
   */
  None,

  /**
   * Occurs when an organization admin forces a user to reset their password.
   */
  AdminForcePasswordReset,

  /**
   * Occurs when a user logs in / unlocks their vault with a master password that does not meet an organization's
   * master password policy that is enforced on login/unlock.
   */
  WeakMasterPassword,
}
