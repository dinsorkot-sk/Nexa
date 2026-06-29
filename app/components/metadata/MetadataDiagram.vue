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

type DiagramField = {
  slug: string
  name: string
  fieldType: string
  isRequired: boolean
  isUnique: boolean
  isVirtual?: boolean
}

type DiagramNodeData = {
  label: string
  fields: DiagramField[]
}

type DiagramNode = {
  id: string
  type: 'entity'
  position: { x: number, y: number }
  data: DiagramNodeData
}

type DiagramEdge = {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  type: 'smoothstep'
  label: string
  animated: true
  style: { stroke: string }
}

const props = defineProps<{
  entities: Entity[]
  relations: Relation[]
}>()

const loading = ref(true)

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

    const nodeMap = new Map<string, { id: string, slug: string, label: string, fields: DiagramField[] }>()

    function fieldLabel(slug: string) {
      return slug
        .split('_')
        .map(part => (part.toLowerCase() === 'id' ? 'ID' : part.charAt(0).toUpperCase() + part.slice(1)))
        .join(' ')
    }

    function ensureField(nodeId: string, field: DiagramField) {
      const node = nodeMap.get(nodeId)
      if (!node) return
      if (!node.fields.some(existing => existing.slug === field.slug)) {
        node.fields.push(field)
      }
    }

    for (const entity of entitiesWithFields) {
      const fields: DiagramField[] = [{
        slug: 'id',
        name: 'ID',
        fieldType: 'id',
        isRequired: true,
        isUnique: true,
        isVirtual: true
      }]

      for (const field of [...entity.fields].sort((a, b) => a.sortOrder - b.sortOrder)) {
        fields.push({
          slug: field.slug,
          name: field.name,
          fieldType: field.fieldType,
          isRequired: !!field.isRequired,
          isUnique: !!field.isUnique
        })
      }

      nodeMap.set(String(entity.id), {
        id: String(entity.id),
        slug: entity.slug,
        label: entity.name,
        fields
      })
    }

    const diagramEdges: DiagramEdge[] = []

    for (const relation of props.relations) {
      const source = nodeMap.get(String(relation.entityId))
      const target = nodeMap.get(String(relation.relatedEntityId))
      if (!source || !target) {
        continue
      }

      if (relation.relationType === 'N:N') {
        const pivotId = `pivot-${relation.id}`
        const sourcePivotSlug = `${source.slug}_id`
        const targetPivotSlug = `${target.slug}_id`

        nodeMap.set(pivotId, {
          id: pivotId,
          slug: relation.pivotTable || `${source.slug}_${relation.slug}`,
          label: relation.pivotTable || `${source.slug}_${relation.slug}`,
          fields: [
            {
              slug: sourcePivotSlug,
              name: fieldLabel(sourcePivotSlug),
              fieldType: 'number',
              isRequired: false,
              isUnique: false,
              isVirtual: true
            },
            {
              slug: targetPivotSlug,
              name: fieldLabel(targetPivotSlug),
              fieldType: 'number',
              isRequired: false,
              isUnique: false,
              isVirtual: true
            }
          ]
        })

        diagramEdges.push({
          id: `relation-${relation.id}-a`,
          source: source.id,
          target: pivotId,
          sourceHandle: 'id:out',
          targetHandle: `${sourcePivotSlug}:in`,
          type: 'smoothstep',
          label: relation.relationType,
          animated: true,
          style: {
            stroke: 'var(--ui-primary)'
          }
        })

        diagramEdges.push({
          id: `relation-${relation.id}-b`,
          source: pivotId,
          target: target.id,
          sourceHandle: `${targetPivotSlug}:out`,
          targetHandle: 'id:in',
          type: 'smoothstep',
          label: relation.relationType,
          animated: true,
          style: {
            stroke: 'var(--ui-primary)'
          }
        })

        continue
      }

      if (relation.relationType === '1:N') {
        const targetFieldSlug = relation.foreignKey || `${source.slug}_id`
        ensureField(String(relation.relatedEntityId), {
          slug: targetFieldSlug,
          name: fieldLabel(targetFieldSlug),
          fieldType: 'number',
          isRequired: !!relation.isRequired,
          isUnique: false,
          isVirtual: true
        })

        diagramEdges.push({
          id: `relation-${relation.id}`,
          source: source.id,
          target: target.id,
          sourceHandle: 'id:out',
          targetHandle: `${targetFieldSlug}:in`,
          type: 'smoothstep',
          label: relation.relationType,
          animated: true,
          style: {
            stroke: 'var(--ui-primary)'
          }
        })
        continue
      }

      const sourceFieldSlug = relation.foreignKey || `${relation.slug}_id`
      ensureField(String(relation.entityId), {
        slug: sourceFieldSlug,
        name: fieldLabel(sourceFieldSlug),
        fieldType: 'number',
        isRequired: !!relation.isRequired,
        isUnique: false,
        isVirtual: true
      })

      diagramEdges.push({
        id: `relation-${relation.id}`,
        source: source.id,
        target: target.id,
        sourceHandle: `${sourceFieldSlug}:out`,
        targetHandle: 'id:in',
        type: 'smoothstep',
        label: relation.relationType,
        animated: true,
        style: {
          stroke: 'var(--ui-primary)'
        }
      })
    }

    const diagramNodes: DiagramNode[] = [...nodeMap.values()].map(node => ({
      id: node.id,
      type: 'entity',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        fields: node.fields
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
