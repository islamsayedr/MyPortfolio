export const SIDEBAR_DEFAULT_WIDTH = 224
export const SIDEBAR_MIN_WIDTH = 200
export const SIDEBAR_MAX_WIDTH = 384
export const SIDEBAR_COLLAPSED_WIDTH = 64
export const SIDEBAR_WIDTH_KEY = 'portfolio.sidebar.width'

// During a pointer drag, follow every pixel from the collapsed rail onward.
// Apply the expanded-width threshold only when the drag is committed.
export function clampSidebarDragWidth(requested: number): number {
  if (!Number.isFinite(requested)) return SIDEBAR_DEFAULT_WIDTH
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_COLLAPSED_WIDTH, Math.round(requested)))
}

// Null represents the collapsed rail. Expanded widths cannot stop at/below
// the collapse threshold, and the pointer cannot make the panel unbounded.
export function resolveSidebarWidth(requested: number): number | null {
  if (!Number.isFinite(requested)) return SIDEBAR_DEFAULT_WIDTH
  const width = Math.round(requested)
  return width <= SIDEBAR_MIN_WIDTH ? null : Math.min(width, SIDEBAR_MAX_WIDTH)
}
