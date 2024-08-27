import { nodeIsElement } from "../utils";

import { DomQueryService as DomQueryServiceInterface } from "./abstractions/dom-query.service";

export class DomQueryService implements DomQueryServiceInterface {
  /**
   * Queries all elements in the DOM that match the given query string.
   * Also, recursively queries all shadow roots for the element.
   *
   * @param root - The root element to start the query from
   * @param queryString - The query string to match elements against
   * @param mutationObserver - The MutationObserver to use for observing shadow roots
   */
  deepQueryElements<T>(
    root: Document | ShadowRoot | Element,
    queryString: string,
    mutationObserver?: MutationObserver,
  ): T[] {
    let elements = this.queryElements<T>(root, queryString);
    const shadowRoots = this.recursivelyQueryShadowRoots(root, mutationObserver);
    for (let index = 0; index < shadowRoots.length; index++) {
      const shadowRoot = shadowRoots[index];
      elements = elements.concat(this.queryElements<T>(shadowRoot, queryString));
    }

    return elements;
  }

  /**
   * Queries the DOM for elements based on the given query string.
   *
   * @param root - The root element to start the query from
   * @param queryString - The query string to match elements against
   */
  private queryElements<T>(root: Document | ShadowRoot | Element, queryString: string): T[] {
    if (!root.querySelector(queryString)) {
      return [];
    }

    return Array.from(root.querySelectorAll(queryString)) as T[];
  }

  /**
   * Recursively queries all shadow roots found within the given root element.
   * Will also set up a mutation observer on the shadow root if the
   * `isObservingShadowRoot` parameter is set to true.
   *
   * @param root - The root element to start the query from
   * @param mutationObserver - The MutationObserver to use for observing shadow roots
   */
  private recursivelyQueryShadowRoots(
    root: Document | ShadowRoot | Element,
    mutationObserver?: MutationObserver,
  ): ShadowRoot[] {
    let shadowRoots = this.queryShadowRoots(root);
    for (let index = 0; index < shadowRoots.length; index++) {
      const shadowRoot = shadowRoots[index];
      shadowRoots = shadowRoots.concat(this.recursivelyQueryShadowRoots(shadowRoot));
      if (mutationObserver) {
        mutationObserver.observe(shadowRoot, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
    }

    return shadowRoots;
  }

  /**
   * Queries any immediate shadow roots found within the given root element.
   *
   * @param root - The root element to start the query from
   */
  private queryShadowRoots(root: Document | ShadowRoot | Element): ShadowRoot[] {
    const shadowRoots: ShadowRoot[] = [];
    const potentialShadowRoots = root.querySelectorAll(":defined");
    for (let index = 0; index < potentialShadowRoots.length; index++) {
      const shadowRoot = this.getShadowRoot(potentialShadowRoots[index]);
      if (shadowRoot) {
        shadowRoots.push(shadowRoot);
      }
    }

    return shadowRoots;
  }

  /**
   * Attempts to get the ShadowRoot of the passed node. If support for the
   * extension based openOrClosedShadowRoot API is available, it will be used.
   * Will return null if the node is not an HTMLElement or if the node has
   * child nodes.
   *
   * @param {Node} node
   */
  private getShadowRoot(node: Node): ShadowRoot | null {
    if (!nodeIsElement(node)) {
      return null;
    }

    if (node.shadowRoot) {
      return node.shadowRoot;
    }

    if ((chrome as any).dom?.openOrClosedShadowRoot) {
      try {
        return (chrome as any).dom.openOrClosedShadowRoot(node);
      } catch (error) {
        return null;
      }
    }

    return (node as any).openOrClosedShadowRoot;
  }

  /**
   * Queries the DOM for all the nodes that match the given filter callback
   * and returns a collection of nodes.
   * @param rootNode
   * @param filterCallback
   * @param mutationObserver
   */
  queryAllTreeWalkerNodes(
    rootNode: Node,
    filterCallback: CallableFunction,
    mutationObserver?: MutationObserver,
  ): Node[] {
    const treeWalkerQueryResults: Node[] = [];

    this.buildTreeWalkerNodesQueryResults(
      rootNode,
      treeWalkerQueryResults,
      filterCallback,
      mutationObserver,
    );

    return treeWalkerQueryResults;
  }

  /**
   * Recursively builds a collection of nodes that match the given filter callback.
   * If a node has a ShadowRoot, it will be observed for mutations.
   *
   * @param rootNode
   * @param treeWalkerQueryResults
   * @param filterCallback
   * @param mutationObserver
   */
  private buildTreeWalkerNodesQueryResults(
    rootNode: Node,
    treeWalkerQueryResults: Node[],
    filterCallback: CallableFunction,
    mutationObserver?: MutationObserver,
  ) {
    const treeWalker = document?.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT);
    let currentNode = treeWalker?.currentNode;

    while (currentNode) {
      if (filterCallback(currentNode)) {
        treeWalkerQueryResults.push(currentNode);
      }

      const nodeShadowRoot = this.getShadowRoot(currentNode);
      if (nodeShadowRoot) {
        if (mutationObserver) {
          mutationObserver.observe(nodeShadowRoot, {
            attributes: true,
            childList: true,
            subtree: true,
          });
        }

        this.buildTreeWalkerNodesQueryResults(
          nodeShadowRoot,
          treeWalkerQueryResults,
          filterCallback,
          mutationObserver,
        );
      }

      currentNode = treeWalker?.nextNode();
    }
  }
}
