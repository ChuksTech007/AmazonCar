import dns from 'dns'
import { promisify } from 'util'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dns.setDefaultResultOrder('ipv4first')

const usePublicDns = !process.env.VERCEL

const resolver = new dns.Resolver()
if (usePublicDns) resolver.setServers(['8.8.8.8', '1.1.1.1'])
const resolve4 = promisify(resolver.resolve4.bind(resolver))
const resolve6 = promisify(resolver.resolve6.bind(resolver))
const osLookup = dns.lookup.bind(dns)

function lookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  const opts = typeof options === 'number' ? { family: options } : options || {}
  const family = opts.family || 0
  const all = Boolean(opts.all)

  const done = (err, records) => {
    if (!callback) return
    if (err) return callback(err)
    if (all) return callback(null, records)
    callback(null, records[0].address, records[0].family)
  }

  ;(async () => {
    const records = []
    if (family === 0 || family === 4) {
      try {
        const addrs = await resolve4(hostname)
        records.push(...addrs.map((address) => ({ address, family: 4 })))
      } catch {
        /* try IPv6 / OS next */
      }
    }
    if (!records.length && (family === 0 || family === 6)) {
      try {
        const addrs = await resolve6(hostname)
        records.push(...addrs.map((address) => ({ address, family: 6 })))
      } catch {
        /* fall through to OS */
      }
    }
    if (records.length) {
      done(null, records)
      return
    }
    osLookup(hostname, opts, (err, address, fam) => {
      if (err) return done(err)
      if (all) return done(null, Array.isArray(address) ? address : [{ address, family: fam }])
      done(null, [{ address, family: fam }])
    })
  })()
}

if (usePublicDns) {
  dns.lookup = lookup
  dns.promises.lookup = (hostname, options) =>
    new Promise((resolve, reject) => {
      lookup(hostname, options || {}, (err, address, family) => {
        if (err) reject(err)
        else if (options?.all) resolve(address)
        else resolve({ address, family })
      })
    })
}

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') })
