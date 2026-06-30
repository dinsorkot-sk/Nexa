import { db, schema } from '@nuxthub/db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Valid module ID is required' })

  const body = await readBody(event)
  const mod = await db.update(schema.modules)
    .set({
      name: body.name,
      slug: body.slug,
      description: body.description,
      icon: body.icon,
      isActive: body.isActive,
      updatedAt: sql`datetime('now')`
    })
    .where(eq(schema.modules.id, id))
    .returning().get()
  if (!mod) throw createError({ statusCode: 404, statusMessage: 'Module not found' })
  return mod
})
