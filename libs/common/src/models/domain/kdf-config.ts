export class KdfConfig {
  iterations: number;
  memory?: number;
  parallelism?: number;

  constructor(iterations: number, memory?: number, parallelism?: number) {
    this.iterations = iterations;
    this.memory = memory;
    this.parallelism = parallelism;
  }
}
