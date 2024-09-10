/** Kinds of credentials that can be stored by the history service
 *  password - a secret consisting of arbitrary characters used to authenticate a user
 *  passphrase - a secret consisting of words used to authenticate a user
 */
export type CredentialCategory = "password" | "passphrase";
