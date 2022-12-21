import { ITreeNodeObject } from "@bitwarden/common/models/domain/tree-node";

export type TopLevelTreeNodeId = "vaults" | "types" | "collections" | "folders";
export type TopLevelTreeNodeName = "allVaults" | "types" | "collections" | "folders";
export class TopLevelTreeNode implements ITreeNodeObject {
  id: TopLevelTreeNodeId;
  name: TopLevelTreeNodeName; // localizationString
}
