import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for OAuth environment configuration validation.
 *
 * These tests validate that required environment variables for OAuth
 * providers (Apple and Google) are properly checked before use.
 *
 * Required environment variables:
 * - Apple OAuth: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
 * - Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */

describe('Environment Config Validation', () => {
  describe('getGoogleOAuthConfig', () => {
    it('returns config when all Google OAuth env vars are present', () => {
      const env = {
        GOOGLE_CLIENT_ID: 'test-google-client-id',
        GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      }

      // This function doesn't exist yet - TDD
      const { getGoogleOAuthConfig } = require('~/lib/env.server')
      const config = getGoogleOAuthConfig(env)

      expect(config).toEqual({
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
      })
    })

    it('throws error when GOOGLE_CLIENT_ID is missing', () => {
      const env = {
        GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      }

      const { getGoogleOAuthConfig } = require('~/lib/env.server')

      expect(() => getGoogleOAuthConfig(env)).toThrow(
        'Missing required environment variable: GOOGLE_CLIENT_ID'
      )
    })

    it('throws error when GOOGLE_CLIENT_SECRET is missing', () => {
      const env = {
        GOOGLE_CLIENT_ID: 'test-google-client-id',
      }

      const { getGoogleOAuthConfig } = require('~/lib/env.server')

      expect(() => getGoogleOAuthConfig(env)).toThrow(
        'Missing required environment variable: GOOGLE_CLIENT_SECRET'
      )
    })

    it('throws error when both Google OAuth env vars are missing', () => {
      const env = {}

      const { getGoogleOAuthConfig } = require('~/lib/env.server')

      expect(() => getGoogleOAuthConfig(env)).toThrow(
        'Missing required environment variable: GOOGLE_CLIENT_ID'
      )
    })

    it('throws error when env vars are empty strings', () => {
      const env = {
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      }

      const { getGoogleOAuthConfig } = require('~/lib/env.server')

      expect(() => getGoogleOAuthConfig(env)).toThrow(
        'Missing required environment variable: GOOGLE_CLIENT_ID'
      )
    })
  })

  describe('getAppleOAuthConfig', () => {
    it('returns config when all Apple OAuth env vars are present', () => {
      const env = {
        APPLE_CLIENT_ID: 'test-apple-client-id',
        APPLE_TEAM_ID: 'test-apple-team-id',
        APPLE_KEY_ID: 'test-apple-key-id',
        APPLE_PRIVATE_KEY: 'test-apple-private-key',
      }

      const { getAppleOAuthConfig } = require('~/lib/env.server')
      const config = getAppleOAuthConfig(env)

      expect(config).toEqual({
        clientId: 'test-apple-client-id',
        teamId: 'test-apple-team-id',
        keyId: 'test-apple-key-id',
        privateKey: 'test-apple-private-key',
      })
    })

    it('throws error when APPLE_CLIENT_ID is missing', () => {
      const env = {
        APPLE_TEAM_ID: 'test-apple-team-id',
        APPLE_KEY_ID: 'test-apple-key-id',
        APPLE_PRIVATE_KEY: 'test-apple-private-key',
      }

      const { getAppleOAuthConfig } = require('~/lib/env.server')

      expect(() => getAppleOAuthConfig(env)).toThrow(
        'Missing required environment variable: APPLE_CLIENT_ID'
      )
    })

    it('throws error when APPLE_TEAM_ID is missing', () => {
      const env = {
        APPLE_CLIENT_ID: 'test-apple-client-id',
        APPLE_KEY_ID: 'test-apple-key-id',
        APPLE_PRIVATE_KEY: 'test-apple-private-key',
      }

      const { getAppleOAuthConfig } = require('~/lib/env.server')

      expect(() => getAppleOAuthConfig(env)).toThrow(
        'Missing required environment variable: APPLE_TEAM_ID'
      )
    })

    it('throws error when APPLE_KEY_ID is missing', () => {
      const env = {
        APPLE_CLIENT_ID: 'test-apple-client-id',
        APPLE_TEAM_ID: 'test-apple-team-id',
        APPLE_PRIVATE_KEY: 'test-apple-private-key',
      }

      const { getAppleOAuthConfig } = require('~/lib/env.server')

      expect(() => getAppleOAuthConfig(env)).toThrow(
        'Missing required environment variable: APPLE_KEY_ID'
      )
    })

    it('throws error when APPLE_PRIVATE_KEY is missing', () => {
      const env = {
        APPLE_CLIENT_ID: 'test-apple-client-id',
        APPLE_TEAM_ID: 'test-apple-team-id',
        APPLE_KEY_ID: 'test-apple-key-id',
      }

      const { getAppleOAuthConfig } = require('~/lib/env.server')

      expect(() => getAppleOAuthConfig(env)).toThrow(
        'Missing required environment variable: APPLE_PRIVATE_KEY'
      )
    })

    it('throws error when all Apple OAuth env vars are missing', () => {
      const env = {}

      const { getAppleOAuthConfig } = require('~/lib/env.server')

      expect(() => getAppleOAuthConfig(env)).toThrow(
        'Missing required environment variable: APPLE_CLIENT_ID'
      )
    })

    it('throws error when env vars are empty strings', () => {
      const env = {
        APPLE_CLIENT_ID: 'test-apple-client-id',
        APPLE_TEAM_ID: '',
        APPLE_KEY_ID: 'test-apple-key-id',
        APPLE_PRIVATE_KEY: 'test-apple-private-key',
      }

      const { getAppleOAuthConfig } = require('~/lib/env.server')

      expect(() => getAppleOAuthConfig(env)).toThrow(
        'Missing required environment variable: APPLE_TEAM_ID'
      )
    })
  })

  describe('validateOAuthEnv', () => {
    it('returns true when all OAuth env vars are present', () => {
      const env = {
        GOOGLE_CLIENT_ID: 'test-google-client-id',
        GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
        APPLE_CLIENT_ID: 'test-apple-client-id',
        APPLE_TEAM_ID: 'test-apple-team-id',
        APPLE_KEY_ID: 'test-apple-key-id',
        APPLE_PRIVATE_KEY: 'test-apple-private-key',
      }

      const { validateOAuthEnv } = require('~/lib/env.server')

      expect(validateOAuthEnv(env)).toBe(true)
    })

    it('throws error listing all missing env vars when multiple are missing', () => {
      const env = {
        GOOGLE_CLIENT_ID: 'test-google-client-id',
        APPLE_CLIENT_ID: 'test-apple-client-id',
      }

      const { validateOAuthEnv } = require('~/lib/env.server')

      expect(() => validateOAuthEnv(env)).toThrow(
        /Missing required environment variables:.*GOOGLE_CLIENT_SECRET.*APPLE_TEAM_ID.*APPLE_KEY_ID.*APPLE_PRIVATE_KEY/
      )
    })

    it('throws error when all OAuth env vars are missing', () => {
      const env = {}

      const { validateOAuthEnv } = require('~/lib/env.server')

      expect(() => validateOAuthEnv(env)).toThrow(
        /Missing required environment variables:/
      )
    })
  })
})
