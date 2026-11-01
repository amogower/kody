import * as childProcess from 'node:child_process'
import { consoleError } from '#worker/test-support/console-spies.ts'
import { expect, test, vi } from 'vitest'
import {
	assertProductionEnvOverridesMatchCommitted,
	ensureProductionResources,
} from './production-resources.ts'

vi.mock('node:child_process', async (importOriginal) => {
	const actual = await importOriginal<typeof childProcess>()
	return {
		...actual,
		spawnSync: vi.fn(() => ({ status: 1, stdout: '', stderr: '' })),
	}
})

const spawnSync = vi.mocked(childProcess.spawnSync)

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

test('a mismatched legacy host throws before any Cloudflare ensure step', async () => {
	consoleError.mockImplementation(() => {})
	const fetchCalls: Array<string> = []
	const fetchMock = vi.fn<typeof fetch>(async (input) => {
		fetchCalls.push(String(input))
		return Response.json({ success: false, errors: [] }, { status: 500 })
	})
	vi.stubGlobal('fetch', fetchMock)
	vi.stubEnv('PACKAGE_APP_LEGACY_HOSTS', 'kody.run')
	vi.stubEnv('CLOUDFLARE_API_TOKEN', 'test-token')
	vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '333b7db000c936f7b7e633a84b600780')
	spawnSync.mockClear()

	await expect(
		ensureProductionResources({
			wranglerConfigPath: 'packages/worker/wrangler.jsonc',
			outConfigPath:
				'packages/worker/wrangler-production.should-not-write.json',
			dryRun: false,
		}),
	).rejects.toThrow(/PACKAGE_APP_LEGACY_HOSTS/)

	expect(fetchMock).not.toHaveBeenCalled()
	expect(fetchCalls).toEqual([])
	expect(spawnSync).not.toHaveBeenCalled()
	expect(consoleError.mock.calls).toEqual([])
})
