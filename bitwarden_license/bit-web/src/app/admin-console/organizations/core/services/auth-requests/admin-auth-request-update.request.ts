export class AdminAuthRequestUpdateRequest {
  /**
   *
   * @param requestApproved - Whether the request was approved/denied. If true, the key must be provided.
   * @param encryptedUserKey The user's symmetric key that has been encrypted with a device public key if the request was approved.
   */
  constructor(public requestApproved: boolean, public encryptedUserKey?: string) {}
}
