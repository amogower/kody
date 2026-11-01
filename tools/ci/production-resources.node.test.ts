import { expect, test } from 'vitest'
import { assertProductionEnvOverridesMatchCommitted } from './production-resources.ts'

const committedVars = {
	APP_BASE_URL: 'https://b4sed.codes',
	CLOUDFLARE_ACCOUNT_ID: '333b7db000c936f7b7e633a84b600780',
	USER_EMAIL_DOMAIN: 'inbox.b4sed.codes',
	SYSTEM_EMAIL_DOMAIN: 'b4sed.codes',
}

test('production env overrides must match committed vars unless explicitly allowed', () => {
	expect(() =>
		assertProductionEnvOverridesMatchCommitted({
			committedVars,
			env: {
				APP_BASE_URL: 'https://kody.codes',
				CLOUDFLARE_ACCOUNT_ID: 'a99ee2e72728dd52902ef288b7b1447d',
			},
		}),
	).toThrow(/APP_BASE_URL/)

	expect(() =>
		assertProductionEnvOverridesMatchCommitted({
			committedVars,
			env: {
				APP_BASE_URL: 'https://b4sed.codes',
				USER_EMAIL_DOMAIN: '',
				SYSTEM_EMAIL_DOMAIN: '   ',
				APP_LEGACY_HOSTS: '',
			},
		}),
	).not.toThrow()

	expect(() =>
		assertProductionEnvOverridesMatchCommitted({
			committedVars,
			env: {},
		}),
	).not.toThrow()

	expect(() =>
		assertProductionEnvOverridesMatchCommitted({
			committedVars,
			env: { APP_LEGACY_HOSTS: 'kody.codes' },
		}),
	).toThrow(/APP_LEGACY_HOSTS/)

	expect(() =>
		assertProductionEnvOverridesMatchCommitted({
			committedVars,
			env: {
				APP_BASE_URL: 'https://kody.codes',
				LEGACY_USER_EMAIL_DOMAINS: 'inbox.kody.codes',
				ALLOW_ENV_VAR_OVERRIDE: '1',
			},
		}),
	).not.toThrow()
})
