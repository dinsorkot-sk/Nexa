---
name: vueflow-changelog
description: >-
  Vue Flow version changelog and migration: breaking changes, API deprecations,
  new features by version, behavior changes. Use when upgrading Vue Flow,
  checking if an API exists in the current version, or debugging version-specific
  behavior.
---

# Vue Flow Changelog

Full changelog: <https://vueflow.dev/changelog/>

## How to Check

Each package has its own changelog page:

- Core: <https://vueflow.dev/changelog/>
- Background: <https://vueflow.dev/changelog/background.html>
- Controls: <https://vueflow.dev/changelog/controls.html>
- Minimap: <https://vueflow.dev/changelog/minimap.html>
- Node Resizer: <https://vueflow.dev/changelog/node-resizer.html>
- Node Toolbar: <https://vueflow.dev/changelog/node-toolbar.html>
- Pathfinding Edge: <https://vueflow.dev/changelog/pathfinding-edge.html>

GitHub releases: <https://github.com/bcakmakoglu/vue-flow/releases>

## Recent Notable Changes (v1.36+)

### v1.48
- Selection disabled on drag when panning mode active
- Better connection position accuracy
- Block pane ctx-menu if panOnDrag includes right-click

### v1.47
- `fitView` padding accepts per-side object (breaking: `offset` → `padding`)

### v1.46
- Exposed `isMacOs` and `wheelDelta` utilities
- `useHandle` / `<Handle>` uses event target for click detection
- Remove border styles from required CSS → moved to theme

### v1.45
- `domAttributes` prop on nodes/edges for custom DOM attrs

### v1.44
- `ease` and `interpolate` options on viewport functions

### v1.42
- `useNodeConnections` composable added
- Connection lookup for selection box accuracy

### v1.40
- `useNodesData` no longer returns `null` as data type
- Simplified event emit definitions

### v1.36
- `updateEdgeData` action added
- `useEdgesData` composable added
- Remove `connectedEdges` from NodeMouseEvents
- Viewport hidden until initial fitView completes
- `initialized` field removed from `GraphNode`
- `onInit` hook added; `onPaneReady` deprecated

## API Deprecations

| Deprecated | Replacement | Since |
|-----------|-------------|-------|
| `onPaneReady` | `onInit` | v1.36 |
| `useVueFlow({ id })` | `useVueFlow(id)` string overload | v1.37 |
| `offset` in fitView | `padding` | v1.47 |
