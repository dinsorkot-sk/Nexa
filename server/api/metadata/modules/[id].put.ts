import { db, schema } from '@nuxthub/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid module ID is required' })

  const body = await readBody(event)
  const updateData: Record<string, unknown> = {}

  // Only set fields that were actually sent in the request
  if (body.name !== undefined) updateData.name = body.name
  if (body.slug !== undefined) updateData.slug = body.slug
  if (body.description !== undefined) updateData.description = body.description
  if (body.icon !== undefined) updateData.icon = body.icon
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.color !== undefined) updateData.color = body.color
  if (body.category !== undefined) updateData.category = body.category
  if (body.version !== undefined) updateData.version = body.version

  updateData.updatedAt = sql`datetime('now')`

  const mod = await db.update(schema.modules)
    .set(updateData)
    .where(eq(schema.modules.id, id))
    .returning().get()
  if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
  return mod
})
