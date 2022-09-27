type CheckableBase = {
  checked?: boolean;
};

export type Checkable<T> = T & CheckableBase;

export function isChecked(item: CheckableBase): boolean {
  return !!item.checked;
}
