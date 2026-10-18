/** @jest-environment node */
import {
  isBlockedAddress,
  isClientIdUrl,
  parseClientMetadata,
} from './client-metadata'
import { validRedirectUri } from './oauth'

jest.mock('@/libs/prisma', () => ({ __esModule: true, default: {} }))

const clientId = 'https://claude.example/oauth/client.json'
const document = {
  client_id: clientId,
  client_name: 'Claude Code',
  redirect_uris: ['http://localhost/callback'],
  token_endpoint_auth_method: 'none',
}

test('accepts only HTTPS document URLs with a path on a host name', () => {
  expect(isClientIdUrl(clientId)).toBe(true)
  for (const value of [
    'client-1',
    'http://claude.example/oauth/client.json',
    'https://claude.example/',
    'https://claude.example/a#b',
    'https://user@claude.example/client.json',
    'https://claude.example:8443/client.json',
    'https://127.0.0.1/client.json',
    'https://[::1]/client.json',
    'https://claude.example/a/../client.json',
    `https://claude.example/${'a'.repeat(255)}`,
  ])
    expect(isClientIdUrl(value)).toBe(false)
})

test('blocks private, loopback, link-local and mapped addresses', () => {
  for (const address of [
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:10.0.0.1',
  ])
    expect(isBlockedAddress(address)).toBe(true)
  expect(isBlockedAddress('160.79.104.10')).toBe(false)
  expect(isBlockedAddress('2607:6bc0::10')).toBe(false)
})

test('reads the client name and redirect URIs from a matching document', () => {
  expect(parseClientMetadata(clientId, document, validRedirectUri)).toEqual({
    name: 'Claude Code',
    redirectUris: ['http://localhost/callback'],
  })
  expect(
    parseClientMetadata(
      clientId,
      { ...document, client_name: undefined },
      validRedirectUri
    ).name
  ).toBe('claude.example')
})

test.each([
  ['a different client_id', { client_id: 'https://evil.example/client.json' }],
  ['a client secret', { client_secret: 'secret' }],
  [
    'a confidential auth method',
    { token_endpoint_auth_method: 'private_key_jwt' },
  ],
  ['no redirect URIs', { redirect_uris: [] }],
  ['an unsafe redirect URI', { redirect_uris: ['http://evil.example/cb'] }],
])('rejects a document with %s', (_, override) =>
  expect(() =>
    parseClientMetadata(
      clientId,
      { ...document, ...override },
      validRedirectUri
    )
  ).toThrow()
)
