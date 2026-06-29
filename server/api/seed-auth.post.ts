import { db, schema } from '@nuxthub/db'
import { hashPassword } from '~~/server/utils/auth'

export default defineEventHandler(async () => {
  // Delete existing auth data
  await db.delete(schema.userRoles).run()
  await db.delete(schema.invites).run()
  await db.delete(schema.sessions).run()
  await db.delete(schema.users).run()
  await db.delete(schema.roles).run()

  // Seed roles
  const [adminRole] = await db.insert(schema.roles).values({
    name: 'Admin',
    slug: 'admin',
    description: 'Full access to all features',
    isSystem: true
  }).returning().all()

  const [memberRole] = await db.insert(schema.roles).values({
    name: 'Member',
    slug: 'member',
    description: 'Standard user with basic access',
    isSystem: true
  }).returning().all()

  // Seed admin user
  const passwordHash = hashPassword('admin123')
  const [adminUser] = await db.insert(schema.users).values({
    name: 'Admin',
    email: 'admin@nexa.dev',
    passwordHash,
    isActive: true
  }).returning().all()

  // Assign admin role
  await db.insert(schema.userRoles).values({
    userId: adminUser!.id,
    roleId: adminRole!.id
  })

  return {
    result: 'Auth seeded',
    adminEmail: 'admin@nexa.dev',
    adminPassword: 'admin123',
    roles: [adminRole!.slug, memberRole!.slug]
  }
})
