import { db, schema } from '@nuxthub/db'

export interface AppConfigData {
  siteName: string
  locale: string
  timezone: string
  logoUrl: string | null
}

const DEFAULT_CONFIG: AppConfigData = {
  siteName: 'Nexa',
  locale: 'en',
  timezone: 'UTC',
  logoUrl: null
}

/**
 * Load app config from DB, falling back to defaults + auto-seed.
 */
export async function getAppConfig(): Promise<AppConfigData> {
  try {
    const [row] = await db.select().from(schema.appConfig).limit(1)
    if (!row) {
      await db.insert(schema.appConfig).values({ id: 1 })
      return { ...DEFAULT_CONFIG }
    }
    return {
      siteName: row.siteName ?? DEFAULT_CONFIG.siteName,
      locale: row.locale ?? DEFAULT_CONFIG.locale,
      timezone: row.timezone ?? DEFAULT_CONFIG.timezone,
      logoUrl: row.logoUrl ?? null
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * Save app config to DB.
 */
export async function saveAppConfig(config: AppConfigData, updatedBy?: number): Promise<void> {
  await db.insert(schema.appConfig)
    .values({
      id: 1,
      siteName: config.siteName,
      locale: config.locale,
      timezone: config.timezone,
      logoUrl: config.logoUrl ?? null,
      updatedBy: updatedBy ?? null,
      updatedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: schema.appConfig.id,
      set: {
        siteName: config.siteName,
        locale: config.locale,
        timezone: config.timezone,
        logoUrl: config.logoUrl ?? null,
        updatedBy: updatedBy ?? null,
        updatedAt: new Date().toISOString()
      }
    })
}
