export interface DomQueryService {
  deepQueryElements<T>(
    root: Document | ShadowRoot | Element,
    queryString: string,
    mutationObserver?: MutationObserver,
  ): T[];
  queryAllTreeWalkerNodes(
    rootNode: Node,
    filterCallback: CallableFunction,
    mutationObserver?: MutationObserver,
  ): Node[];
}
