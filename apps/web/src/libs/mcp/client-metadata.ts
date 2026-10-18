import { lookup, type LookupAddress, type LookupOptions } from 'dns'
import { request } from 'https'
import { BlockList, isIP } from 'net'

// Client ID Metadata Documents: the client_id is an HTTPS URL serving the client's metadata.
export type ClientMetadata = { name: string; redirectUris: string[] }

const MAX_BYTES = 5 * 1024
const TIMEOUT_MS = 5000
const MIN_CACHE_SECONDS = 60
const MAX_CACHE_SECONDS = 24 * 3600
const DEFAULT_CACHE_SECONDS = 3600
const MAX_CACHE_ENTRIES = 1000

const blocked = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const)
  blocked.addSubnet(network, prefix, 'ipv4')
// IPv4-mapped IPv6 addresses (::ffff:a.b.c.d) are matched against the IPv4 rules above by BlockList.
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const)
  blocked.addSubnet(network, prefix, 'ipv6')

export function isBlockedAddress(address: string) {
  const family = isIP(address)
  return family === 0 || blocked.check(address, family === 4 ? 'ipv4' : 'ipv6')
}

export function isClientIdUrl(value: string) {
  if (value.length > 255 || !value.startsWith('https://')) return false
  try {
    const url = new URL(value)
    return (
      url.href === value &&
      url.pathname !== '/' &&
      !url.hash &&
      !url.username &&
      !url.password &&
      !url.port &&
      isIP(url.hostname.replace(/^\[|\]$/g, '')) === 0 &&
      !url.pathname.split('/').some((part) => part === '.' || part === '..')
    )
  } catch {
    return false
  }
}

export function parseClientMetadata(
  clientId: string,
  document: unknown,
  validRedirectUri: (uri: string) => boolean
): ClientMetadata {
  if (!document || typeof document !== 'object' || Array.isArray(document))
    throw new Error('metadata must be a JSON object')
  const metadata = document as Record<string, unknown>
  if (metadata.client_id !== clientId)
    throw new Error('client_id does not match the document URL')
  if ('client_secret' in metadata || 'client_secret_expires_at' in metadata)
    throw new Error('metadata must not contain a client secret')
  if (
    metadata.token_endpoint_auth_method !== undefined &&
    metadata.token_endpoint_auth_method !== 'none'
  )
    throw new Error('only public clients are supported')
  const uris = metadata.redirect_uris
  if (
    !Array.isArray(uris) ||
    uris.length < 1 ||
    uris.length > 10 ||
    uris.some(
      (uri) =>
        typeof uri !== 'string' || uri.length > 2048 || !validRedirectUri(uri)
    )
  )
    throw new Error('redirect_uris are invalid')
  const name =
    typeof metadata.client_name === 'string'
      ? metadata.client_name.trim().slice(0, 120)
      : ''
  return { name: name || new URL(clientId).hostname, redirectUris: uris }
}

function cacheSeconds(cacheControl: string | undefined) {
  if (cacheControl && /\b(no-store|no-cache)\b/.test(cacheControl))
    return MIN_CACHE_SECONDS
  const maxAge = /\bmax-age=(\d+)/.exec(cacheControl || '')
  const seconds = maxAge ? Number(maxAge[1]) : DEFAULT_CACHE_SECONDS
  return Math.min(Math.max(seconds, MIN_CACHE_SECONDS), MAX_CACHE_SECONDS)
}

// Resolves the host ourselves so a public name cannot point the request at internal addresses.
function safeLookup(
  hostname: string,
  options: LookupOptions,
  callback: (
    error: NodeJS.ErrnoException | null,
    address: string | LookupAddress[],
    family?: number
  ) => void
) {
  lookup(hostname, options, (error, address, family) => {
    if (error) return callback(error, '')
    const addresses = Array.isArray(address)
      ? address.map((entry) => entry.address)
      : [address]
    if (addresses.some(isBlockedAddress))
      return callback(new Error('client metadata host is not public'), '')
    callback(null, address, family)
  })
}

function download(clientId: string) {
  return new Promise<{ body: string; cacheControl?: string }>(
    (resolve, reject) => {
      const req = request(
        clientId,
        {
          headers: { Accept: 'application/json' },
          lookup: safeLookup as never,
          timeout: TIMEOUT_MS,
        },
        (res) => {
          // Redirects are not followed: the document must live at the client_id URL itself.
          if (res.statusCode !== 200) {
            res.resume()
            return reject(new Error(`unexpected status ${res.statusCode}`))
          }
          if (
            !res.headers['content-type']
              ?.split(';')[0]
              .trim()
              .toLowerCase()
              .endsWith('json')
          ) {
            res.resume()
            return reject(new Error('metadata must be JSON'))
          }
          let size = 0
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => {
            size += chunk.length
            if (size > MAX_BYTES) {
              req.destroy(new Error('metadata is too large'))
              return
            }
            chunks.push(chunk)
          })
          res.on('end', () =>
            resolve({
              body: Buffer.concat(chunks).toString('utf8'),
              cacheControl: res.headers['cache-control'],
            })
          )
          res.on('error', reject)
        }
      )
      req.on('timeout', () =>
        req.destroy(new Error('metadata request timed out'))
      )
      req.on('error', reject)
      req.end()
    }
  )
}

const cache = new Map<string, { expires: number; metadata: ClientMetadata }>()

export async function fetchClientMetadata(
  clientId: string,
  validRedirectUri: (uri: string) => boolean
) {
  const cached = cache.get(clientId)
  if (cached && cached.expires > Date.now()) return cached.metadata
  const { body, cacheControl } = await download(clientId)
  const metadata = parseClientMetadata(
    clientId,
    JSON.parse(body),
    validRedirectUri
  )
  if (cache.size >= MAX_CACHE_ENTRIES) cache.clear()
  cache.set(clientId, {
    expires: Date.now() + cacheSeconds(cacheControl) * 1000,
    metadata,
  })
  return metadata
}
