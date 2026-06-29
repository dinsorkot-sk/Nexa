---
name: vueflow-troubleshooting
description: >-
  Vue Flow debugging and troubleshooting: missing styles, connection issues,
  drag/selection bugs, keyboard a11y, node dimensions, edge path problems,
  event handling, performance, TypeScript types, common errors. Use when
  debugging Vue Flow components.
---

# Vue Flow Troubleshooting

## Missing Styles

**Problem**: Flow looks broken, no background, nodes overlap.

**Fix**: Import CSS (unscoped only):
```ts
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
```
Do NOT use `scoped` styles. Do NOT import in `<style scoped>`.

## Nodes Not Draggable

- Check `:draggable` prop on `<VueFlow>` or on individual node
- Default is `true`. Set to `false` to disable globally or per node.
- If `panOnDrag` conflicts, use different mouse button for panning

## Pan/Scroll Not Working

- `panOnDrag` accepts boolean or array of mouse buttons: `[1, 2]` for left+middle
- `panOnScroll` / `zoomOnScroll` can be disabled
- `panOnScrollMode`: `'free'` | `'vertical'` | `'horizontal'`
- Check if `panActivationKeyCode` requires a modifier key

## Connection Issues

- Handles need correct `type` (source/target) and `position`
- `connectionMode`: `'strict'` (source→target only) vs `'loose'` (any direction)
- `isValidConnection` callback can reject connections
- `connectionRadius` controls snap distance (default 20)
- `Connection` object needs `{ source, target, sourceHandle?, targetHandle? }`

## Selection Not Working

- `selectionOnDrag`: `true` or `false`
- `selectionKeyCode`: key to hold for selection mode (e.g., `'Shift'`, or `true` for permanent)
- `multiSelectionKeyCode`: add to selection (default `'Shift'`)
- `selectionMode`: `'partial'` (default, any part overlaps) or `'full'`

## Events Not Firing

- Check event name casing: `@node-click` not `@nodeClick`
- For programmatic listeners, use `onNodeClick` or `useVueFlow().on.nodeClick`
- Events only fire if there's at least one listener bound (perf optimization)

## Node Dimensions Not Updating

- Nodes must have `width`/`height` calculated after mount
- Use `updateNodeDimensions()` or `updateNodeInternals([id])` after
  dynamic content changes
- `useNodesInitialized()` returns true when all nodes have dimensions

## Edge Path Wrong

- `source` and `target` must reference valid node IDs
- `sourceHandle` / `targetHandle` must match handle IDs on nodes
- If handles have no explicit `id`, use `null`
- Default edge type is `bezier`; try `straight`, `step`, or `smoothstep`

## TypeScript Errors

- Node type: `Node<MyData>` where `MyData` is the data shape
- Edge type: `Edge<MyData>`
- Custom node props: `NodeProps<MyData>`
- Custom edge props: `EdgeProps<MyData>`
- Use `GraphNode` / `GraphEdge` for internal resolved types

## Keyboard A11y Issues

- Disable with `disableKeyboardA11y` on `<VueFlow>`
- Arrow keys move selected nodes
- Delete key removes selected elements
- Escape cancels connection/drag/selection

## Performance

- `onlyRenderVisibleElements` - skip rendering off-screen (default false)
- `nodesDraggable` / `nodesConnectable` / `elementsSelectable` - disable globally
- Avoid deeply reactive data in node/edge `data` objects

## Common Errors

- **"Missing required styles"**: Add the CSS imports
- **"useVueFlow must be used inside VueFlow"**: Call inside a child component
- **"Cannot read properties of undefined"**: Node ID typo in edge source/target
- **"Handle was not found"**: Handle ID mismatch, or `<Handle>` not rendered

## References

- Troubleshooting: <https://vueflow.dev/guide/troubleshooting.html>
- Controlled Flow: <https://vueflow.dev/guide/controlled-flow.html>
