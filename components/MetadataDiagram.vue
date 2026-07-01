<script setup lang="ts">
import type { Entity, Field, Relation } from '~/types/metadata'

const props = defineProps<{
  entities: Entity[]
  relations: Relation[]
}>()

const svgWidth = computed(() => Math.max(800, props.entities.length * 280))
const svgHeight = computed(() => {
  if (props.entities.length === 0) return 400
  const maxFields = Math.max(...props.entities.map(e => (e as Entity & { fields?: Field[] }).fields?.length || 0), 1)
  return Math.max(400, Math.ceil(props.entities.length / 3) * (160 + maxFields * 22) + 80)
})

const layout = computed(() => {
  const cols = Math.min(props.entities.length, 3)
  const entities = props.entities.map((e, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const fields: Field[] = (e as Entity & { fields?: Field[] }).fields || []
    const boxHeight = 48 + fields.length * 22 + 12
    return {
      ...e,
      x: col * 260 + 40,
      y: row * (320 + 40) + 40,
      width: 220,
      height: boxHeight,
      centerX: col * 260 + 40 + 110,
      centerY: row * (320 + 40) + 40 + boxHeight / 2,
      fields
    }
  })

  const entityMap = new Map(entities.map(e => [e.id, e]))
  const lines = props.relations.map((r) => {
    const from = entityMap.get(r.entityId)
    const to = entityMap.get(r.relatedEntityId)
    if (!from || !to) return null
    // Right edge of source → Left edge of target
    return {
      x1: from.x + from.width,
      y1: from.centerY,
      x2: to.x,
      y2: to.centerY,
      label: r.name,
      type: r.relationType
    }
  }).filter(Boolean)

  return { entities, lines }
})

function _fieldIcon(type: string): string {
  const icons: Record<string, string> = {
    number: '🔢', text: 'Aa', textarea: '📝', boolean: '✓',
    date: '📅', email: '✉', url: '🔗', uuid: '🔑',
    select: '📋', json: '{}'
  }
  return icons[type] || '▪'
}
</script>

<template>
  <div class="w-full h-full flex items-center justify-center p-6">
    <template v-if="layout.entities.length">
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="shadow"
            x="-2"
            y="-2"
            width="8"
            height="8"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              flood-color="#000"
              flood-opacity="0.15"
            />
          </filter>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#888" />
          </marker>
          <marker
            id="arrowhead1n"
            markerWidth="10"
            markerHeight="8"
            refX="10"
            refY="4"
            orient="auto"
          >
            <path d="M0 0 L10 4 L0 8 Z" fill="#888" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="#888"
              stroke-width="1"
            />
          </marker>
          <marker
            id="arrowheadnn"
            markerWidth="10"
            markerHeight="8"
            refX="10"
            refY="4"
            orient="auto"
          >
            <path d="M0 0 L10 4 L0 8 Z" fill="#888" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke="#888"
              stroke-width="1"
            />
          </marker>
        </defs>

        <!-- Relation lines -->
        <g v-for="(line, i) in layout.lines" :key="'line-' + i">
          <!-- Connection line -->
          <line
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            stroke="#666"
            stroke-width="1.5"
            stroke-dasharray="5,3"
            marker-end="url(#arrowhead)"
          />
          <!-- Label background -->
          <rect
            :x="(line.x1 + line.x2) / 2 - 30"
            :y="(line.y1 + line.y2) / 2 - 8"
            width="60"
            height="16"
            rx="4"
            fill="var(--ui-bg, #0f0f0f)"
            stroke="#444"
            stroke-width="0.5"
          />
          <text
            :x="(line.x1 + line.x2) / 2"
            :y="(line.y1 + line.y2) / 2"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#aaa"
            font-size="8"
            font-family="monospace"
          >
            {{ line.label }}
          </text>
          <!-- Relation type badge -->
          <rect
            :x="(line.x1 + line.x2) / 2 + 32"
            :y="(line.y1 + line.y2) / 2 - 6"
            width="20"
            height="12"
            rx="3"
            fill="#1e3a5f"
            stroke="#3b82f6"
            stroke-width="0.5"
          />
          <text
            :x="(line.x1 + line.x2) / 2 + 42"
            :y="(line.y1 + line.y2) / 2"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#60a5fa"
            font-size="6"
            font-weight="bold"
          >
            {{ line.type }}
          </text>
        </g>

        <!-- Entity boxes -->
        <g v-for="entity in layout.entities" :key="'entity-' + entity.id">
          <!-- Box shadow -->
          <rect
            :x="entity.x"
            :y="entity.y"
            :width="entity.width"
            :height="entity.height"
            rx="8"
            ry="8"
            fill="var(--ui-bg-elevated, #1a1a2e)"
            stroke="var(--ui-border, #333)"
            stroke-width="1"
            filter="url(#shadow)"
          />
          <!-- Header -->
          <rect
            :x="entity.x"
            :y="entity.y"
            :width="entity.width"
            height="36"
            rx="8"
            ry="8"
            fill="var(--ui-primary, #3b82f6)"
            fill-opacity="0.15"
          />
          <rect
            :x="entity.x"
            :y="entity.y + 28"
            :width="entity.width"
            height="8"
            fill="var(--ui-primary, #3b82f6)"
            fill-opacity="0.15"
          />
          <!-- Entity icon + name -->
          <text
            :x="entity.x + entity.width / 2"
            :y="entity.y + 22"
            text-anchor="middle"
            dominant-baseline="central"
            fill="var(--ui-text, #e5e7eb)"
            font-size="11"
            font-weight="bold"
          >
            {{ entity.icon ? '○' : '▨' }} {{ entity.name }}
          </text>
          <!-- Fields list -->
          <g v-for="(field, fi) in entity.fields" :key="'field-' + field.id">
            <line
              v-if="fi === 0"
              :x1="entity.x + 8"
              :y1="entity.y + 38"
              :x2="entity.x + entity.width - 8"
              :y2="entity.y + 38"
              stroke="var(--ui-border, #333)"
              stroke-width="0.5"
            />
            <text
              :x="entity.x + 10"
              :y="entity.y + 52 + fi * 22"
              dominant-baseline="central"
              font-size="9"
              font-family="monospace"
            >
              <tspan v-if="field.slug === 'id'" fill="#facc15" font-weight="bold">🔑</tspan>
              <tspan fill="var(--ui-text, #e5e7eb)">{{ field.name }}</tspan>
              <tspan fill="#888"> : </tspan>
              <tspan :fill="field.fieldType === 'number' ? '#60a5fa' : field.fieldType === 'uuid' ? '#34d399' : '#888'">{{ field.fieldType }}</tspan>
              <tspan v-if="field.isRequired" fill="#f87171" font-size="7"> *</tspan>
            </text>
          </g>
        </g>
      </svg>
    </template>
    <template v-else>
      <div class="text-center">
        <UIcon name="i-lucide-panel-right-dashed" class="size-12 mx-auto mb-3 text-(--ui-text-muted)" />
        <p class="text-sm text-(--ui-text-muted)">
          Create entities and relations to see the diagram
        </p>
      </div>
    </template>
  </div>
</template>
