import assert from 'node:assert/strict'
import test from 'node:test'
import { clampSidebarDragWidth, resolveSidebarWidth, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from '../src/dashboard/sidebar-size'

test('sidebar resizing preserves expanded widths and clamps the maximum', () => {
  assert.equal(resolveSidebarWidth(SIDEBAR_DEFAULT_WIDTH), SIDEBAR_DEFAULT_WIDTH)
  assert.equal(resolveSidebarWidth(320), 320)
  assert.equal(resolveSidebarWidth(320.6), 321)
  assert.equal(resolveSidebarWidth(2000), SIDEBAR_MAX_WIDTH)
})
test('pointer dragging responds continuously below the expanded-width minimum', () => {
  for (const width of [64, 65, 80, 120, 180, 200, 201]) assert.equal(clampSidebarDragWidth(width), width)
  assert.equal(clampSidebarDragWidth(20), 64)
  assert.equal(clampSidebarDragWidth(500), SIDEBAR_MAX_WIDTH)
  assert.equal(clampSidebarDragWidth(NaN), SIDEBAR_DEFAULT_WIDTH)
})
test('sidebar snaps to the collapsed rail at its minimum width', () => {
  for (const width of [0, 64, -10, SIDEBAR_MIN_WIDTH, 200.4]) assert.equal(resolveSidebarWidth(width), null)
  assert.equal(resolveSidebarWidth(200.6), 201)
})
test('invalid resize values use the safe default', () => {
  for (const width of [NaN, Infinity, -Infinity]) assert.equal(resolveSidebarWidth(width), SIDEBAR_DEFAULT_WIDTH)
})
