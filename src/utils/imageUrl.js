export function withCacheBuster(url) {
  if (!url || typeof url !== 'string') return url
  const base = url.split('?')[0]
  return `${base}?v=${Date.now()}`
}
