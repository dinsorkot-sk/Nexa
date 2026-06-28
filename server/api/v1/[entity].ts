import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'
import { findMany, findOne, createOne, updateOne, deleteOne, forceDelete, restoreOne } from '../../engine/query'
import { parseInclude } from '../../engine/include'
import type { QueryOptions } from '../../engine/query'
import type { InferSelectModel } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { buildEntitySchema, filterKnownFields, coerceFieldTypes } from '../../utils/validate'

type EntityRow = InferSelectModel<typeof schema.entities>
type FieldRow = InferSelectModel<typeof schema.fields>

/** Load fields for a given entity */
async function getFieldsForEntity(entityId: number): Promise<FieldRow[]> {
  return await db.select().from(schema.fields).where(eq(schema.fields.entityId, entityId)).all() as FieldRow[]
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const entitySlug = getRouterParam(event, 'entity')
  if (!entitySlug) throw createError({ statusCode: 400, statusMessage: 'Entity slug required' })

  const entity = await db.select().from(schema.entities).where(eq(schema.entities.slug, entitySlug)).get() as EntityRow | undefined
  if (!entity) throw createError({ statusCode: 404, statusMessage: `Entity "${entitySlug}" not found` })

  const query = getQuery(event)
  const include = parseInclude(query.include as string | undefined)
  const filter = query.filter as Record<string, string> | undefined
  const sort = query.sort as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const trash = query.trash === 'true'

  const opts: QueryOptions = {
    include: include.map(i => i.relation),
    filter,
    sort,
    page,
    limit,
    trash
  }

  // Handle by ID (?id=123) — supports GET/PUT/DELETE via query param
  const id = query.id ? parseInt(query.id as string) : undefined
  if (id) return handleById(event, db, entity, id, opts)

  switch (method) {
    case 'GET':
      return findMany(db, entity.tableName, entity.slug, opts)
    case 'POST': {
      const body = await readBody(event)
      return handleCreate(event, db, entity, body)
    }
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})

async function handleCreate(
  _event: H3Event,
  _db: typeof db,
  entity: EntityRow,
  body: Record<string, unknown>
) {
  // Load fields & validate
  const fields = await getFieldsForEntity(entity.id)
  const schema = buildEntitySchema(fields)

  // Coerce types from string payloads (form data / JSON)
  const coerced = coerceFieldTypes(body, fields)
  // Remove unknown fields
  const known = filterKnownFields(coerced, fields)

  // Zod validation
  const parsed = schema.partial().safeParse(known)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: parsed.error.flatten().fieldErrors
    })
  }

  return createOne(db, entity.tableName, parsed.data as Record<string, unknown>)
}

async function handleById(
  event: H3Event,
  _db: typeof db,
  entity: EntityRow,
  id: number,
  opts: QueryOptions
) {
  const method = event.method
  switch (method) {
    case 'GET':
      return findOne(db, entity.tableName, entity.slug, id, opts)
    case 'PUT': {
      const body = await readBody(event)

      // Load fields & validate
      const fields = await getFieldsForEntity(entity.id)
      const entitySchema = buildEntitySchema(fields)
      const coerced = coerceFieldTypes(body, fields)
      const known = filterKnownFields(coerced, fields)
      const parsed = entitySchema.partial().safeParse(known)
      if (!parsed.success) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation failed',
          data: parsed.error.flatten().fieldErrors
        })
      }

      return updateOne(db, entity.tableName, id, parsed.data as Record<string, unknown>)
    }
    case 'DELETE': {
      const hardDelete = getQuery(event).hard_delete === 'true'
      if (hardDelete) {
        await forceDelete(db, entity.tableName, id)
        return { success: true, message: 'Permanently deleted' }
      }
      await deleteOne(db, entity.tableName, id)
      return { success: true, message: 'Soft deleted' }
    }
    case 'PATCH': {
      // Restore soft-deleted record
      const action = getQuery(event).action
      if (action === 'restore') {
        const restored = await restoreOne(db, entity.tableName, id)
        return restored || { success: false, message: 'Record not found' }
      }
      throw createError({ statusCode: 400, statusMessage: 'Invalid action. Use ?action=restore to restore.' })
    }
    default:
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
}
