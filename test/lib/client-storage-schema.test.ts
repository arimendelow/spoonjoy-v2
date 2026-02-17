import { beforeEach, describe, expect, it } from 'vitest'
import {
  APP_STORAGE_SCHEMA_VERSION,
  __internal__,
  applyStorageSchemaMigration,
} from '~/lib/client-storage-schema'

describe('client storage schema migration', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('clears app-scoped local/session storage on schema change and preserves theme', () => {
    window.localStorage.setItem('spoonjoy-theme', 'dark')
    window.localStorage.setItem('spoonjoy-nav-state', 'stale')
    window.localStorage.setItem('ingredient-input-mode', 'manual')
    window.localStorage.setItem('unrelated-key', 'keep')

    window.sessionStorage.setItem('spoonjoy-auth-flow', 'stale')
    window.sessionStorage.setItem('session-unrelated', 'keep')

    applyStorageSchemaMigration()

    expect(window.localStorage.getItem('spoonjoy-theme')).toBe('dark')
    expect(window.localStorage.getItem('spoonjoy-nav-state')).toBeNull()
    expect(window.localStorage.getItem('ingredient-input-mode')).toBeNull()
    expect(window.localStorage.getItem('unrelated-key')).toBe('keep')

    expect(window.sessionStorage.getItem('spoonjoy-auth-flow')).toBeNull()
    expect(window.sessionStorage.getItem('session-unrelated')).toBe('keep')

    expect(window.localStorage.getItem(__internal__.STORAGE_SCHEMA_VERSION_KEY)).toBe(
      APP_STORAGE_SCHEMA_VERSION
    )
  })

  it('does nothing when current schema version already matches', () => {
    window.localStorage.setItem('spoonjoy-theme', 'light')
    window.localStorage.setItem('spoonjoy-nav-state', 'keep')
    window.localStorage.setItem(__internal__.STORAGE_SCHEMA_VERSION_KEY, APP_STORAGE_SCHEMA_VERSION)

    applyStorageSchemaMigration()

    expect(window.localStorage.getItem('spoonjoy-theme')).toBe('light')
    expect(window.localStorage.getItem('spoonjoy-nav-state')).toBe('keep')
  })
})
