export class SyncedItemMetadata {
  propertyKey: string;
  sessionKey: string;
  ctor?: new () => any;
  initializer?: (keyValuePair: any) => any;
  initializeAsArray?: boolean;

  static builder(metadata: SyncedItemMetadata): (o: any) => any {
    const itemBuilder =
      metadata.initializer != null
        ? metadata.initializer
        : (o: any) => Object.assign(new metadata.ctor(), o);
    if (metadata.initializeAsArray) {
      return (keyValuePair: any) => keyValuePair.map((o: any) => itemBuilder(o));
    } else {
      return (keyValuePair: any) => itemBuilder(keyValuePair);
    }
  }
}
