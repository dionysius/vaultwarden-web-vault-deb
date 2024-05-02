export class DefaultOffscreenDocumentService implements DefaultOffscreenDocumentService {
  private workerCount = 0;

  constructor() {}

  async withDocument<T>(
    reasons: chrome.offscreen.Reason[],
    justification: string,
    callback: () => Promise<T> | T,
  ): Promise<T> {
    this.workerCount++;
    try {
      if (!(await this.documentExists())) {
        await this.create(reasons, justification);
      }

      return await callback();
    } finally {
      this.workerCount--;
      if (this.workerCount === 0) {
        await this.close();
      }
    }
  }

  private async create(reasons: chrome.offscreen.Reason[], justification: string): Promise<void> {
    await chrome.offscreen.createDocument({
      url: "offscreen-document/index.html",
      reasons,
      justification,
    });
  }

  private async close(): Promise<void> {
    await chrome.offscreen.closeDocument();
  }

  private async documentExists(): Promise<boolean> {
    return await chrome.offscreen.hasDocument();
  }
}
