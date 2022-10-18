export type TabMessage = CopyTextTabMessage | TabMessageBase<"clearClipboard">;

export type TabMessageBase<T extends string> = {
  command: T;
};

export type CopyTextTabMessage = TabMessageBase<"copyText"> & {
  text: string;
};
