export enum OrganizationUserType {
  Owner = 0,
  Admin = 1,
  User = 2,
  /**
   * @deprecated
   * This is deprecated with the introduction of Flexible Collections.
   */
  Manager = 3,
  Custom = 4,
}
