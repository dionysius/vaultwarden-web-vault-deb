export type InitializeOptions = "array" | "record" | "object";

export class SyncedItemMetadata {
  propertyKey: string;
  sessionKey: string;
  ctor?: new () => any;
  initializer?: (keyValuePair: any) => any;
  initializeAs: InitializeOptions;

  static builder(metadata: SyncedItemMetadata): (o: any) => any {
    const itemBuilder =
      metadata.initializer != null
        ? metadata.initializer
        : (o: any) => Object.assign(new metadata.ctor(), o);
    if (metadata.initializeAs === "array") {
      return (keyValuePair: any) => keyValuePair.map((o: any) => itemBuilder(o));
    } else if (metadata.initializeAs === "record") {
      return (keyValuePair: any) => {
        const record: Record<any, any> = {};
        for (const key in keyValuePair) {
          record[key] = itemBuilder(keyValuePair[key]);
        }
        return record;
      };
    } else {
      return (keyValuePair: any) => itemBuilder(keyValuePair);
    }
  }
}
