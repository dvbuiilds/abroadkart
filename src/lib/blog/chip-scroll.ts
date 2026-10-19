export interface ChipScrollInput {
  /** scrollLeft to restore after a chip click, or null for none. */
  saved: number | null;
  /** Offset of the active chip inside the row, or null when no chip is active. */
  chipLeft: number | null;
  chipWidth: number;
  /** Visible width of the row. */
  viewport: number;
  /** Largest valid scrollLeft: scrollWidth - viewport. */
  max: number;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/**
 * Where the chip row should scroll to. Keeps the saved offset when the active
 * chip is still fully visible there; otherwise centres the active chip.
 */
export function scrollLeftFor({ saved, chipLeft, chipWidth, viewport, max }: ChipScrollInput): number {
  if (chipLeft === null) return clamp(saved ?? 0, max);

  if (saved !== null) {
    const visible = chipLeft >= saved && chipLeft + chipWidth <= saved + viewport;
    if (visible) return clamp(saved, max);
  }

  return clamp(chipLeft + chipWidth / 2 - viewport / 2, max);
}
