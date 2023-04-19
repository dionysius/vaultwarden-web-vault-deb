export interface BitwardenPasswordProtectedFileFormat {
  encrypted: boolean;
  passwordProtected: boolean;
  salt: string;
  kdfIterations: number;
  kdfMemory?: number;
  kdfParallelism?: number;
  kdfType: number;
  encKeyValidation_DO_NOT_EDIT: string;
  data: string;
}
