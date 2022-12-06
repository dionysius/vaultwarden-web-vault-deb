export abstract class EventUploadService {
  uploadEvents: (userId?: string) => Promise<void>;
}
