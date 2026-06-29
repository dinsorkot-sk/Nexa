---
name: vueflow-typedocs
description: >-
  Vue Flow TypeScript API reference: function signatures, interface shapes,
  type aliases, enums, variables. Use when looking up exact types,
  function parameters, interface fields for @vue-flow/core.
---

# Vue Flow TypeDocs

Full reference: <https://vueflow.dev/typedocs/>

## Functions

| Function | Signature |
|----------|-----------|
| `addEdge` | `(edgeParams, edges) => Edge[]` |
| `applyChanges` | `(changes, elements) => (Node \| Edge)[]` |
| `applyNodeChanges` | `(changes, nodes) => Node[]` |
| `applyEdgeChanges` | `(changes, edges) => Edge[]` |
| `getBezierPath` | `(params) => string` |
| `getSimpleBezierPath` | `(params) => string` |
| `getSmoothStepPath` | `(params) => string` |
| `getStraightPath` | `(params) => string` |
| `getConnectedEdges` | `(node, edges) => Edge[]` |
| `getIncomers` | `(node, nodes, edges) => Node[]` |
| `getOutgoers` | `(node, nodes, edges) => Node[]` |
| `getNodesInside` | `(rect, nodes, partially?) => Node[]` |
| `getRectOfNodes` | `(nodes) => Rect` |
| `getTransformForBounds` | `(bounds, width, height, minZoom?, maxZoom?, padding?) => ViewportTransform` |
| `updateEdge` | `(oldEdge, connection, edges) => Edge[]` |
| `connectionExists` | `(connection, edges) => boolean` |
| `isNode` | `(element) => boolean` |
| `isEdge` | `(element) => boolean` |
| `clamp` | `(val, min, max) => number` |
| `pointToRendererPoint` | `(point, transform) => XYPosition` |
| `rendererPointToPoint` | `(point, transform) => XYPosition` |
| `wheelDelta` | `(event) => number` |

## Key Interfaces

| Interface | Key Fields |
|-----------|-----------|
| `Node<T>` | `id, type?, position, label?, data?: T, style?, class?, width?, height?` |
| `Edge<T>` | `id, source, target, type?, label?, animated?, sourceHandle?, targetHandle?, data?: T, style?` |
| `GraphNode<T>` | Internal node with `computedPosition`, `dimensions`, `handleBounds` |
| `GraphEdge` | Internal edge with computed path data |
| `FlowProps` | All `<VueFlow>` component props |
| `FlowExportObject` | `{ nodes, edges, viewport }` |
| `FlowImportObject` | `{ nodes?, edges?, viewport? }` |
| `ViewportTransform` | `{ x, y, zoom }` |
| `XYPosition` | `{ x, y }` |
| `Connection` | `{ source, sourceHandle?, target, targetHandle? }` |
| `HandleProps` | `{ type, position, id?, isConnectable?, isValidConnection? }` |
| `NodeProps` | `{ id, data, type, selected, sourcePosition, targetPosition, ... }` |
| `EdgeProps` | `{ id, source, target, sourceX, sourceY, targetX, targetY, ... }` |
| `NodeDragEvent` | `{ node, nodes, event }` |
| `EdgeMouseEvent` | `{ edge, event }` |
| `Actions` | All store actions |
| `Getters` | All store getters |
| `State` | Full store state |
| `VueFlowStore` | Typed store shape |

## Enums

| Enum | Values |
|------|--------|
| `Position` | `Left`, `Top`, `Right`, `Bottom` |
| `ConnectionMode` | `Loose`, `Strict` |
| `ConnectionLineType` | `Bezier`, `Straight`, `Step`, `SmoothStep` |
| `BackgroundVariant` | `Lines`, `Dots`, `Cross` |
| `MarkerType` | `Arrow`, `ArrowClosed` |
| `PanelPosition` | `TopLeft`, `TopCenter`, `TopRight`, `BottomLeft`, `BottomCenter`, `BottomRight` |
| `PanOnScrollMode` | `Free`, `Vertical`, `Horizontal` |
| `SelectionMode` | `Partial`, `Full` |
| `ResizeControlVariant` | `Line`, `Handle` |
| `ErrorCode` | Error codes for `VueFlowError` |

## Key Type Aliases

- `NodeChange` = `NodeDimensionChange | NodePositionChange | NodeAddChange | NodeRemoveChange | NodeSelectionChange`
- `EdgeChange` = `EdgeAddChange | EdgeRemoveChange | EdgeSelectionChange`
- `Elements` = `(Node | Edge)[]`
- `FlowElement` = `Node | Edge`
- `NodeLookup` = `Map<string, GraphNode>`
- `EdgeLookup` = `Map<string, GraphEdge>`
- `ConnectionLookup` = `Map<string, HandleConnection[]>`

## Variables

- `VueFlow` - Main component reference
- `VueFlowInjection` - Injection key for flow state
- `NodeIdInjection` - Injection key for node ID context
- `defaultNodeTypes` - Built-in node types
- `defaultEdgeTypes` - Built-in edge types
- `BezierEdge`, `SimpleBezierEdge`, `SmoothStepEdge`, `StepEdge`, `StraightEdge` - Edge components
