---
name: vueflow-examples
description: >-
  Vue Flow implementation patterns and examples: drag & drop, save & restore,
  interactions, custom nodes/edges, layout, nesting, node resizer/toolbar,
  edge markers/validation/updatable, pinia integration, teleport, transition,
  stress test, helper lines, screenshot. Use when implementing specific Vue
  Flow features and need reference patterns.
---

# Vue Flow Examples

All examples: <https://vueflow.dev/examples/>

## Basic

Simple flow with default node/edge types, minimap, and controls.
<https://vueflow.dev/examples/>

## Drag & Drop

DnD from external palette into the flow. Uses `useVueFlow` actions like
`addNodes` / `screenToFlowPoint` to place nodes at drop position.
<https://vueflow.dev/examples/dnd.html>

## Interactions

Events: node/edge click, drag, mouse enter/leave, context menu, connect,
selection, viewport change. Custom event handlers on `<VueFlow>`.
<https://vueflow.dev/examples/interaction.html>

## Save & Restore

Serialize flow with `toObject()` / `fromObject()`. Store in localStorage
or API. Persist viewport, nodes, and edges.
<https://vueflow.dev/examples/save.html>

## Custom Nodes

Slot-based custom node templates. Use `<Handle>` for connection points.
Register via `nodeTypes` prop on `<VueFlow>`.
<https://vueflow.dev/examples/nodes/>

### Update Node

Modify node data dynamically, inline editing.
<https://vueflow.dev/examples/nodes/update-node.html>

### Intersections

Detect node intersections using `getIntersectingNodes`.
<https://vueflow.dev/examples/nodes/intersection.html>

### Nesting

Parent-child nodes (node inside node). Parent moves all children.
<https://vueflow.dev/examples/nodes/nesting.html>

### Node Resizer

`<NodeResizer>` component for resize handles on custom nodes.
<https://vueflow.dev/examples/nodes/node-resizer.html>

### Node Toolbar

`<NodeToolbar>` for contextual actions attached to nodes.
<https://vueflow.dev/examples/nodes/node-toolbar.html>

## Edges

Edge types: bezier, straight, step, smoothstep.
<https://vueflow.dev/examples/edges/>

### Updatable Edge

Reorder connections by dragging edge endpoints.
<https://vueflow.dev/examples/edges/updatable-edge.html>

### Custom Connection Line

Override the line drawn during connection creation.
<https://vueflow.dev/examples/edges/connection-line.html>

### Connection Validation

`isValidConnection` callback to allow/deny connections.
<https://vueflow.dev/examples/edges/validation.html>

### Edge Markers

Arrow markers on edges (`MarkerType.ArrowClosed`, etc.).
<https://vueflow.dev/examples/edges/markers.html>

### Connection Radius

Snap distance for connection target detection.
<https://vueflow.dev/examples/edges/connection-radius.html>

### Loopback Edge

Edge from a node to itself.
<https://vueflow.dev/examples/edges/loopback.html>

## Layout

### Simple Layout

Use `dagre` or similar for auto-layout.
<https://vueflow.dev/examples/layout/simple.html>

### Animation & Layout

Animated transitions between layout states.
<https://vueflow.dev/examples/layout/animated.html>

## Other Examples

| Example | Description |
|---------|-------------|
| Pinia Store | Use Pinia to manage flow state |
| Teleport | Teleport nodes to different DOM locations |
| Transition | Viewport transition animations |
| Stress Test | Performance with many nodes/edges |
| Helper Lines | Alignment guides during drag |
| Screenshot | Export flow as image |
| Confirm Delete | Confirmation before node/edge deletion |
| Hidden | Toggle node/edge visibility |
| Multiple Flows | Independent flows on same page |
| Math Operation Flow | Node-based computation graph |

<https://vueflow.dev/examples/math.html>
<https://vueflow.dev/examples/screenshot.html>
<https://vueflow.dev/examples/confirm.html>
<https://vueflow.dev/examples/hidden.html>
<https://vueflow.dev/examples/multi.html>
<https://vueflow.dev/examples/pinia.html>
<https://vueflow.dev/examples/teleport.html>
<https://vueflow.dev/examples/transition.html>
<https://vueflow.dev/examples/stress.html>
<https://vueflow.dev/examples/helper-lines.html>
