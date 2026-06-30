import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async () => {
  const list = await db.select().from(schema.relations).all()
  const entities = await db.select().from(schema.entities).all()
  const entMap = new Map(entities.map((e: Record<string, unknown>) => [e.id, e]))
  return list.map((r: Record<string, unknown>) => ({
    ...r,
    entityName: (entMap.get(r.entityId as number) as Record<string, unknown> | undefined)?.name ?? '',
    relatedEntityName: (entMap.get(r.relatedEntityId as number) as Record<string, unknown> | undefined)?.name ?? ''
  }))
})
