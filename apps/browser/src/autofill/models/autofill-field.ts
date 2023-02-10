/**
 * Represents a single field that is collected from the page source and is potentially autofilled.
 */
export default class AutofillField {
  /**
   * The unique identifier assigned to this field during collection of the page details
   */
  opid: string;
  /**
   * Sequential number assigned to each element collected, based on its position in the DOM.
   * Used to do perform proximal checks for username and password fields on the DOM.
   */
  elementNumber: number;
  /**
   * Designates whether the field is visible, based on the element's style
   */
  visible: boolean;
  /**
   * Designates whether the field is viewable on the current part of the DOM that the user can see
   */
  viewable: boolean;
  /**
   * The HTML `id` attribute of the field
   */
  htmlID: string;
  /**
   * The HTML `name` attribute of the field
   */
  htmlName: string;
  /**
   * The HTML `class` attribute of the field
   */
  htmlClass: string;
  /**
   * The concatenated `innerText` or `textContent` of all the elements that are to the "left" of the field in the DOM
   */
  "label-left": string;
  /**
   * The concatenated `innerText` or `textContent` of all the elements that are to the "right" of the field in the DOM
   */
  "label-right": string;
  /**
   * For fields in a data table, the contents of the table row immediately above the field
   */
  "label-top": string;
  /**
   * The contatenated `innerText` or `textContent` of all elements that are HTML labels for the field
   */
  "label-tag": string;
  /**
   * The `aria-label` attribute for the field
   */
  "label-aria": string;
  /**
   * The HTML `placeholder` attribute for the field
   */
  placeholder: string;
  /**
   * The HTML `type` attribute for the field
   */
  type: string;
  /**
   * The HTML `value` for the field
   */
  value: string;
  /**
   * The `disabled` status of the field
   */
  disabled: boolean;
  /**
   * The `readonly` status of the field
   */
  readonly: boolean;
  /**
   * @deprecated
   * The `onePasswordFieldType` from the `dataset` on the element.
   * If empty it contains the HTML `type` attribute for the field.
   */
  onePasswordFieldType: string;
  /**
   * The `opid` attribute value of the form that contains the field
   */
  form: string;
  /**
   * The `x-autocompletetype`, `autocompletetype`, or `autocomplete` attribute for the field
   */
  autoCompleteType: string;
  /**
   * For `<select>` elements, an array of the element's option `text` values
   */
  selectInfo: any;
  /**
   * The `maxLength` attribute for the field
   */
  maxLength: number;
  /**
   * The `tagName` for the field
   */
  tagName: string;
  [key: string]: any;
}
