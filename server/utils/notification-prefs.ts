import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

export interface NotificationPrefs {
  emailEnabled: boolean
  desktopEnabled: boolean
  weeklyDigest: boolean
  productUpdates: boolean
  importantUpdates: boolean
}

const DEFAULTS: NotificationPrefs = {
  emailEnabled: true,
  desktopEnabled: false,
  weeklyDigest: false,
  productUpdates: true,
  importantUpdates: true
}

/**
 * Get notification preferences for a user. Auto-creates row with defaults if missing.
 */
export async function getNotificationPrefs(userId: number): Promise<NotificationPrefs> {
  const [row] = await db
    .select()
    .from(schema.notificationPrefs)
    .where(eq(schema.notificationPrefs.userId, userId))
    .limit(1)

  if (!row) {
    await db.insert(schema.notificationPrefs).values({ userId })
    return { ...DEFAULTS }
  }

  return {
    emailEnabled: row.emailEnabled ?? DEFAULTS.emailEnabled,
    desktopEnabled: row.desktopEnabled ?? DEFAULTS.desktopEnabled,
    weeklyDigest: row.weeklyDigest ?? DEFAULTS.weeklyDigest,
    productUpdates: row.productUpdates ?? DEFAULTS.productUpdates,
    importantUpdates: row.importantUpdates ?? DEFAULTS.importantUpdates
  }
}

/**
 * Save notification preferences for a user.
 */
export async function saveNotificationPrefs(userId: number, prefs: Partial<NotificationPrefs>): Promise<void> {
  await db.insert(schema.notificationPrefs)
    .values({
      userId,
      emailEnabled: prefs.emailEnabled ?? DEFAULTS.emailEnabled,
      desktopEnabled: prefs.desktopEnabled ?? DEFAULTS.desktopEnabled,
      weeklyDigest: prefs.weeklyDigest ?? DEFAULTS.weeklyDigest,
      productUpdates: prefs.productUpdates ?? DEFAULTS.productUpdates,
      importantUpdates: prefs.importantUpdates ?? DEFAULTS.importantUpdates,
      updatedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: schema.notificationPrefs.userId,
      set: {
        emailEnabled: prefs.emailEnabled ?? DEFAULTS.emailEnabled,
        desktopEnabled: prefs.desktopEnabled ?? DEFAULTS.desktopEnabled,
        weeklyDigest: prefs.weeklyDigest ?? DEFAULTS.weeklyDigest,
        productUpdates: prefs.productUpdates ?? DEFAULTS.productUpdates,
        importantUpdates: prefs.importantUpdates ?? DEFAULTS.importantUpdates,
        updatedAt: new Date().toISOString()
      }
    })
}
