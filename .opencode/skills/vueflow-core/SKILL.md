---
name: vueflow-core
description: >-
  Vue Flow core concepts: setup, components (VueFlow, Background, MiniMap,
  Controls, NodeToolbar, NodeResizer), nodes, edges, handles, composables
  (useVueFlow, useNode, useEdge, useNodesData, useHandleConnections),
  configuration, state, events, theming, slots. Use when implementing Vue Flow
  from scratch or adding core features.
---

# Vue Flow Core

## Installation

```bash
npm i @vue-flow/core
pnpm i @vue-flow/core
yarn add @vue-flow/core
```

Import styles (unscoped):
```ts
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'

const nodes = ref([
  { id: '1', type: 'input', label: 'Node 1', position: { x: 250, y: 5 } },
  { id: '2', label: 'Node 2', position: { x: 100, y: 100 } },
])

const edges = ref([
  { id: 'e1-2', source: '1', target: '2', animated: true },
])
</script>

<template>
  <VueFlow v-model:nodes="nodes" v-model:edges="edges">
    <Background />
    <MiniMap />
    <Controls />
  </VueFlow>
</template>
```

## Nodes & Edges

**Node**: `{ id, type?, position: {x,y}, label?, data?, style?, class? }`
**Edge**: `{ id, source, target, type?, animated?, label?, sourceHandle?, targetHandle?, style? }`

**Default node types**: `input`, `default`, `output` | **Default edge types**: `bezier`, `straight`, `step`, `smoothstep`

Custom types via `nodeTypes` / `edgeTypes` prop.

## Handles

```vue
<script setup>
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <div>
    <Handle type="source" :position="Position.Bottom" />
    <Handle type="target" :position="Position.Top" />
  </div>
</template>
```

Props: `type` (source|target), `position`, `id` (optional), `isConnectable`, `isValidConnection`

## Key Composables

| Composable | Purpose |
|-----------|---------|
| `useVueFlow(id?)` | Access flow instance (actions, getters, state) |
| `useNode(id)` | Reactive node data by ID |
| `useEdge(id)` | Reactive edge data by ID |
| `useNodesData(ids)` | Reactive data from multiple nodes |
| `useEdgesData(ids)` | Reactive data from multiple edges |
| `useHandleConnections({ type, id?, nodeId?, onConnect?, onDisconnect? })` | Handle connections |
| `useNodeConnections({ id?, nodeId?, onConnect?, onDisconnect? })` | Node connections |
| `useNodeId()` | Current node ID (inside custom node) |
| `useConnection()` | Active connection state |
| `useHandle(type, id?)` | Handle state |
| `useKeyPress(key)` | Keyboard press detection |
| `useNodesInitialized()` | All nodes initialized check |
| `useGetPointerPosition()` | Pointer position relative to flow |

## Key Props on `<VueFlow>`

`v-model:nodes`, `v-model:edges`, `nodeTypes`, `edgeTypes`, `defaultViewport`, `fitViewOnInit`, `minZoom`/`maxZoom`, `panOnDrag`, `selectionOnDrag`/`selectionKeyCode`, `panOnScroll`, `zoomOnScroll`, `zoomOnPinch`, `autoPanOnNodeDrag`/`autoPanSpeed`, `snapToGrid`/`snapGrid`, `onlyRenderVisibleElements`, `connectionMode` (Loose|Strict), `nodeOrigin`, `elevateNodesOnSelect`, `paneClickDistance`, `deleteKeyCode`, `multiSelectionKeyCode`, `id`, `disableKeyboardA11y`

## Events

`@node-click`, `@node-drag`, `@node-drag-start`, `@node-drag-end`,
`@edge-click`, `@edge-mouse-enter`, `@edge-mouse-leave`,
`@connect`, `@connect-start`, `@connect-end`,
`@pane-click`, `@pane-scroll`, `@pane-context-menu`,
`@viewport-change`, `@viewport-initialized`,
`@selection-change`, `@selection-drag`, `@selection-end`,
`@nodes-change`, `@edges-change`,
`@node-mouse-enter`, `@node-mouse-leave`, `@node-context-menu`,
`@edge-context-menu`, `@edge-update`, `@edge-update-start`, `@edge-update-end`,
`@before-delete`

## Actions (from useVueFlow)

`addNodes`, `addEdges`, `removeNodes`, `removeEdges`, `setNodes`, `setEdges`,
`updateNode`, `updateNodeData`, `updateEdge`, `updateEdgeData`,
`findNode`, `findEdge`, `fitView`, `fitBounds`, `setViewport`, `setCenter`,
`zoomIn`, `zoomOut`, `zoomTo`, `project`, `screenToFlowPoint`, `flowToScreenPoint`,
`getConnectedEdges`, `getIncomers`, `getOutgoers`, `getNodesInside`,
`getIntersectingNodes`, `isNodeIntersecting`, `toObject`, `fromObject`,
`updateNodeDimensions`, `updateNodeInternals`

## Components

| Component | Purpose |
|-----------|---------|
| `<Background>` | Grid or dot background pattern |
| `<MiniMap>` | Mini overview map |
| `<Controls>` | Zoom/pan buttons |
| `<NodeToolbar>` | Toolbar attached to nodes |
| `<NodeResizer>` | Resize handles on nodes |
| `<Panel>` | Custom panel positioning |

## Graph Utils

`addEdge`, `applyChanges`, `applyEdgeChanges`, `applyNodeChanges`,
`getConnectedEdges`, `getIncomers`, `getOutgoers`, `getNodesInside`,
`getRectOfNodes`, `getBezierPath`, `getSimpleBezierPath`,
`getSmoothStepPath`, `getStraightPath`, `isNode`, `isEdge`,
`updateEdge`, `connectionExists`, `getTransformForBounds`

## Theming

CSS vars: `--vf-bg`, `--vf-color`, `--vf-node-bg`, `--vf-node-color`,
`--vf-edge-stroke`, `--vf-edge-stroke-selected`, `--vf-handle-bg`,
`--vf-handle-border`, `--vf-attachment-bg`, `--vf-attachment-border`,
`--vf-minimap-bg`, `--vf-controls-btn-bg`, `--vf-controls-btn-color`

## References

- Guide: <https://vueflow.dev/guide/>
- Nodes: <https://vueflow.dev/guide/node.html>
- Edges: <https://vueflow.dev/guide/edge.html>
- Handles: <https://vueflow.dev/guide/handle.html>
- Composables: <https://vueflow.dev/guide/composables.html>
- Config: <https://vueflow.dev/guide/vue-flow/config.html>
- State: <https://vueflow.dev/guide/vue-flow/state.html>
- Events: <https://vueflow.dev/guide/vue-flow/events.html>
- Slots: <https://vueflow.dev/guide/vue-flow/slots.html>
