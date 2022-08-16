export class SyncedItemMetadata {
  propertyKey: string;
  sessionKey: string;
  ctor?: new () => any;
  initializer?: (keyValuePair: any) => any;
  initializeAsArray?: boolean;

  static buildFromKeyValuePair(keyValuePair: any, metadata: SyncedItemMetadata): any {
    const builder = SyncedItemMetadata.getBuilder(metadata);

    if (metadata.initializeAsArray) {
      return keyValuePair.map((o: any) => builder(o));
    } else {
      return builder(keyValuePair);
    }
  }

  private static getBuilder(metadata: SyncedItemMetadata): (o: any) => any {
    return metadata.initializer != null
      ? metadata.initializer
      : (o: any) => Object.assign(new metadata.ctor(), o);
  }
}
