/**
 * Snap a line endpoint to the nearest 45° increment (0°, 45°, 90°, 135°, …)
 * relative to the start point. Preserves the original distance.
 */
export function snapToAxis(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { x: number; y: number } {
  const dx = endX - startX
  const dy = endY - startY
  const distance = Math.hypot(dx, dy)
  if (distance === 0) return { x: endX, y: endY }

  const angle = Math.atan2(dy, dx)
  const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
  return {
    x: startX + distance * Math.cos(snapped),
    y: startY + distance * Math.sin(snapped),
  }
}
