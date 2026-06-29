import { db, schema } from '@nuxthub/db'
import { requireAuth } from '~~/server/utils/session'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const rows = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      avatarUrl: schema.users.avatarUrl,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt
    })
    .from(schema.users)
    .all()

  // Get roles for each user
  const members = await Promise.all(rows.map(async (user) => {
    const userRoles = await db
      .select({
        id: schema.roles.id,
        name: schema.roles.name,
        slug: schema.roles.slug
      })
      .from(schema.userRoles)
      .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
      .where(eq(schema.userRoles.userId, user.id))

    return {
      ...user,
      roles: userRoles
    }
  }))

  return members
})
