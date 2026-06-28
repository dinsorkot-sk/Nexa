import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

/** GET|PUT|DELETE /api/metadata/entities/:id */
export default defineEventHandler(async (event) => {
  const method = event.method
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid entity ID is required' })
  }

  switch (method) {
    case 'GET': {
      const entity = await db.select().from(schema.entities).where(eq(schema.entities.id, id)).get()
      if (!entity) throw createError({ statusCode: 404, statusMessage: 'Entity not found' })
      const fields = await db.select().from(schema.fields)
        .where(eq(schema.fields.entityId, id))
        .orderBy(schema.fields.sortOrder)
        .all()
      const rels = await db.select().from(schema.relations)
        .where(eq(schema.relations.entityId, id))
        .all()
      return { ...entity, fields, relations: rels }
    }

    case 'PUT': {
      const body = await readBody(event)
      const entity = await db.update(schema.entities)
        .set({
          name: body.name,
          slug: body.slug,
          tableName: body.tableName,
          description: body.description,
          icon: body.icon,
          moduleId: body.moduleId,
          isActive: body.isActive,
          updatedAt: "datetime('now')"
        })
        .where(eq(schema.entities.id, id))
        .returning().get()
      if (!entity) throw createError({ statusCode: 404, statusMessage: 'Entity not found' })
      return entity
    }

    case 'DELETE': {
      const entity = await db.select().from(schema.entities).where(eq(schema.entities.id, id)).get()
      if (entity) {
        const { dropEntity } = await import('../../../engine/sync')
        const { invalidateRelationCache } = await import('../../../engine/query')
        try {
          await dropEntity(db, { tableName: entity.tableName, slug: entity.slug })
        } catch {
          // Table may not exist
        }
        invalidateRelationCache()
      }
      await db.delete(schema.entities).where(eq(schema.entities.id, id)).run()
      return { success: true }
    }

    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
