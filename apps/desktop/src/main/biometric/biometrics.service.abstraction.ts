export abstract class BiometricsServiceAbstraction {
  init: () => Promise<void>;
  supportsBiometric: () => Promise<boolean>;
  authenticateBiometric: () => Promise<boolean>;
}
