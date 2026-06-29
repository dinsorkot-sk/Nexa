<script setup lang="ts">
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { VueFlow } from '@vue-flow/core'
import dagre from 'dagre'
import { ref, watch } from 'vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import type { Entity, EntityWithFields, Relation } from '~/types/metadata'
import ErdNode from './ErdNode.vue'

const props = defineProps<{
  entities: Entity[]
  relations: Relation[]
}>()

const loading = ref(true)
type ErdField = {
  name: string
  fieldType: string
  isRequired: boolean
  isUnique: boolean
}

type DiagramNode = {
  id: string
  type: 'entity'
  position: { x: number, y: number }
  data: {
    label: string
    fields: ErdField[]
  }
}

type DiagramEdge = {
  id: string
  source: string
  target: string
  type: 'smoothstep'
  label: string
  animated: boolean
  style: { stroke: string }
}

const nodes = ref<DiagramNode[]>([])
const edges = ref<DiagramEdge[]>([])

const nodeTypes = {
  entity: ErdNode
}

async function loadDiagram() {
  if (!import.meta.client) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    if (!props.entities.length) {
      nodes.value = []
      edges.value = []
      return
    }

    const entitiesWithFields = (await Promise.allSettled(
      props.entities.map(entity => $fetch<EntityWithFields>(`/api/metadata/entities/${entity.id}`))
    ))
      .filter((result): result is PromiseFulfilledResult<EntityWithFields> => result.status === 'fulfilled')
      .map(result => result.value)

    const diagramNodes: DiagramNode[] = entitiesWithFields.map((entity) => {
      const fields = [...entity.fields].sort((a, b) => a.sortOrder - b.sortOrder).map(field => ({
        name: field.name,
        fieldType: field.fieldType,
        isRequired: !!field.isRequired,
        isUnique: !!field.isUnique
      }))

      return {
        id: String(entity.id),
        type: 'entity',
        position: { x: 0, y: 0 },
        data: {
          label: entity.name,
          fields
        }
      }
    })

    const diagramEdges: DiagramEdge[] = props.relations.map(relation => ({
      id: `relation-${relation.id}`,
      source: String(relation.entityId),
      target: String(relation.relatedEntityId),
      type: 'smoothstep',
      label: relation.relationType,
      animated: true,
      style: {
        stroke: 'var(--ui-primary)'
      }
    }))

    const graph = new dagre.graphlib.Graph()
    graph.setDefaultEdgeLabel(() => ({}))
    graph.setGraph({ rankdir: 'LR', nodesep: 48, ranksep: 140 })

    diagramNodes.forEach((node) => {
      const height = 56 + Math.max(node.data.fields.length, 1) * 34
      graph.setNode(node.id, { width: 280, height })
    })

    diagramEdges.forEach((edge) => {
      if (edge.source !== edge.target) {
        graph.setEdge(edge.source, edge.target)
      }
    })

    dagre.layout(graph)

    nodes.value = diagramNodes.map((node) => {
      const position = graph.node(node.id) ?? { x: 0, y: 0 }
      const height = 56 + Math.max(node.data.fields.length, 1) * 34

      return {
        ...node,
        position: {
          x: position.x - 140,
          y: position.y - height / 2
        }
      }
    })

    edges.value = diagramEdges
  } finally {
    loading.value = false
  }
}

watch(
  () => JSON.stringify({
    entities: props.entities.map(entity => [entity.id, entity.name]),
    relations: props.relations.map(relation => [relation.id, relation.entityId, relation.relatedEntityId, relation.name, relation.relationType])
  }),
  loadDiagram,
  { immediate: true }
)
</script>

<template>
  <div class="h-full min-h-[32rem] bg-elevated/60">
    <div v-if="loading" class="flex h-full items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-(--ui-text-muted)" />
    </div>

    <div v-else-if="!nodes.length" class="flex h-full items-center justify-center p-8 text-center">
      <div>
        <UIcon name="i-lucide-git-branch" class="mx-auto mb-3 size-10 text-(--ui-text-muted)" />
        <p class="text-sm font-medium text-(--ui-text)">
          No entities yet
        </p>
        <p class="mt-1 text-sm text-(--ui-text-muted)">
          Add entities and relations to generate the ER diagram.
        </p>
      </div>
    </div>

    <ClientOnly v-else>
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        class="h-full"
        fit-view-on-init
        :min-zoom="0.25"
        :max-zoom="2"
      >
        <Background pattern-color="var(--ui-border-dimmed)" :gap="18" />
        <Controls />
        <MiniMap pannable zoomable />
      </VueFlow>
    </ClientOnly>
  </div>
</template>

<style scoped>
:deep(.vue-flow__edge-path) {
  stroke: var(--ui-border-dimmed);
  stroke-width: 2;
}

:deep(.vue-flow__edge-label) {
  padding: 2px 6px;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: var(--ui-bg);
  color: var(--ui-text-muted);
  font-size: 11px;
  font-weight: 600;
}

:deep(.vue-flow__minimap) {
  background: color-mix(in srgb, var(--ui-bg) 86%, transparent);
}
</style>
