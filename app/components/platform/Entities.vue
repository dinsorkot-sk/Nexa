<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')

interface EntityRow {
  name: string
  slug: string
  module: string
  fields: number
  relations: number
  status: 'active' | 'draft' | 'archived'
}

const { data } = await useAsyncData('platform-entities', () => Promise.resolve([
  { name: 'Users', slug: 'users', module: 'Authentication', fields: 12, relations: 4, status: 'active' },
  { name: 'Roles', slug: 'roles', module: 'Authorization', fields: 6, relations: 3, status: 'active' },
  { name: 'Permissions', slug: 'permissions', module: 'Authorization', fields: 5, relations: 2, status: 'active' },
  { name: 'Posts', slug: 'posts', module: 'Content', fields: 9, relations: 5, status: 'active' },
  { name: 'Categories', slug: 'categories', module: 'Content', fields: 4, relations: 2, status: 'draft' },
  { name: 'Reports', slug: 'reports', module: 'Report', fields: 8, relations: 3, status: 'draft' }
] as EntityRow[]), { default: () => [] })

const columns: TableColumn<EntityRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'module', header: 'Module' },
  { accessorKey: 'fields', header: 'Fields' },
  { accessorKey: 'relations', header: 'Relations' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = { active: 'success' as const, draft: 'warning' as const, archived: 'neutral' as const }[row.getValue('status') as string]
      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => row.getValue('status'))
    }
  }
]
</script>

<template>
  <UCard :ui="{ body: 'p-0!' }">
    <UTable
      :data="data"
      :columns="columns"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    />
  </UCard>
</template>
