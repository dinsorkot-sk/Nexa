<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

export type ErdField = {
  name: string
  fieldType: string
  isRequired: boolean
  isUnique: boolean
}

type ErdNodeData = {
  label: string
  fields: ErdField[]
}

const props = defineProps<NodeProps<ErdNodeData>>()
</script>

<template>
  <div class="erd-node" :class="{ 'erd-node--selected': props.selected }">
    <Handle type="target" :position="Position.Top" />

    <div class="erd-node__head">
      {{ props.data.label }}
    </div>

    <div class="erd-node__body">
      <div v-for="field in props.data.fields" :key="field.name" class="erd-node__field">
        <div class="erd-node__field-name">
          <span>{{ field.name }}</span>
          <span v-if="field.isRequired" class="erd-node__pill">req</span>
          <span v-if="field.isUnique" class="erd-node__pill">uniq</span>
        </div>
        <span class="erd-node__type">{{ field.fieldType }}</span>
      </div>

      <div v-if="!props.data.fields.length" class="erd-node__empty">
        No fields
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.erd-node {
  min-width: 240px;
  max-width: 320px;
  border: 1px solid var(--ui-border);
  border-radius: 14px;
  background: var(--ui-bg);
  overflow: hidden;
  box-shadow: 0 12px 30px rgb(0 0 0 / 0.08);
}

.erd-node--selected {
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 25%, transparent), 0 12px 30px rgb(0 0 0 / 0.08);
}

.erd-node__head {
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ui-primary-contrast);
  background: color-mix(in srgb, var(--ui-primary) 88%, black);
  letter-spacing: 0.01em;
}

.erd-node__body {
  display: grid;
}

.erd-node__field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 14px;
  border-top: 1px solid var(--ui-border);
  font-size: 12px;
}

.erd-node__field-name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-weight: 500;
  color: var(--ui-text);
}

.erd-node__type {
  flex: none;
  color: var(--ui-text-dimmed);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 10px;
}

.erd-node__pill {
  flex: none;
  padding: 1px 5px;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  color: var(--ui-text-dimmed);
  font-size: 10px;
  line-height: 1.2;
}

.erd-node__empty {
  padding: 12px 14px;
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-dimmed);
  font-size: 12px;
}
</style>
