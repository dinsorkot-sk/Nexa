import { db, schema } from '@nuxthub/db'

export interface AuthConfigData {
  providers: { password: boolean, oauth2: boolean, saml: boolean }
  session: { absoluteTimeout: number, idleTimeout: number, refreshTokenTTL: number }
  security: { concurrentSessions: boolean, mfaEnabled: boolean }
}

const DEFAULT_CONFIG: AuthConfigData = {
  providers: { password: true, oauth2: false, saml: false },
  session: { absoluteTimeout: 1440, idleTimeout: 30, refreshTokenTTL: 7 },
  security: { concurrentSessions: true, mfaEnabled: false }
}

/**
 * Load auth config from DB, falling back to defaults.
 */
export async function getAuthConfig(): Promise<AuthConfigData> {
  try {
    const [row] = await db
      .select()
      .from(schema.authConfig)
      .limit(1)

    if (!row) {
      // Seed the singleton row with defaults
      await db.insert(schema.authConfig).values({
        id: 1,
        providers: JSON.stringify(DEFAULT_CONFIG.providers),
        session: JSON.stringify(DEFAULT_CONFIG.session),
        security: JSON.stringify(DEFAULT_CONFIG.security)
      })
      return { ...DEFAULT_CONFIG }
    }

    return {
      providers: JSON.parse(row.providers) ?? DEFAULT_CONFIG.providers,
      session: JSON.parse(row.session) ?? DEFAULT_CONFIG.session,
      security: JSON.parse(row.security) ?? DEFAULT_CONFIG.security
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * Save auth config to DB.
 */
export async function saveAuthConfig(config: AuthConfigData, updatedBy?: number): Promise<void> {
  await db.insert(schema.authConfig)
    .values({
      id: 1,
      providers: JSON.stringify(config.providers),
      session: JSON.stringify(config.session),
      security: JSON.stringify(config.security),
      updatedBy: updatedBy ?? null,
      updatedAt: new Date().toISOString()
    })
    .onConflictDoUpdate({
      target: schema.authConfig.id,
      set: {
        providers: JSON.stringify(config.providers),
        session: JSON.stringify(config.session),
        security: JSON.stringify(config.security),
        updatedBy: updatedBy ?? null,
        updatedAt: new Date().toISOString()
      }
    })
}
