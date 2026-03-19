/**
 * Minimal UI component idea.
 * Since we dont have a framework (for now at least) these can be used
 * imperatively insert the element in the DOM
 *
 * Idk about this syntax, it looks a bit pretentious to me...
 */
export interface UIComponent<Props> {
  (props: Props): HTMLElement;
}
