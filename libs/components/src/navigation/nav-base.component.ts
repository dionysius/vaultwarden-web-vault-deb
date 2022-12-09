import { Directive, EventEmitter, Input, Output } from "@angular/core";

/**
 * Base class used in `NavGroupComponent` and `NavItemComponent`
 */
@Directive()
export abstract class NavBaseComponent {
  /**
   * Text to display in main content
   */
  @Input() text: string;

  /**
   * `aria-label` for main content
   */
  @Input() ariaLabel: string;

  /**
   * Optional icon, e.g. `"bwi-collection"`
   */
  @Input() icon: string;

  /**
   * Route to be passed to internal `routerLink`
   */
  @Input() route: string | any[];

  /**
   * If this item is used within a tree, set `variant` to `"tree"`
   */
  @Input() variant: "default" | "tree" = "default";

  /**
   * Depth level when nested inside of a `'tree'` variant
   */
  @Input() treeDepth = 0;

  /**
   * If `true`, do not change styles when nav item is active.
   */
  @Input() hideActiveStyles = false;

  /**
   * Fires when main content is clicked
   */
  @Output() mainContentClicked: EventEmitter<MouseEvent> = new EventEmitter();
}
