import { eq } from 'drizzle-orm'
import { db, schema } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = query.id ? parseInt(query.id as string) : undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  await db.delete(schema.genericReferences).where(eq(schema.genericReferences.id, id)).run()
  return { success: true }
})
