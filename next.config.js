/** @type {import('next').NextConfig} */
// Propostas privadas: HTML estático em public/<cliente>/index.html, fora do índice de busca.
const PROPOSTAS = ['imports-company', 'nikiti']

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  async rewrites() {
    return PROPOSTAS.map(slug => ({ source: `/${slug}`, destination: `/${slug}/index.html` }))
  },
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    return PROPOSTAS.flatMap(slug => [
      { source: `/${slug}/:path*`, headers: noindex },
      { source: `/${slug}`, headers: noindex },
    ])
  },
}
module.exports = nextConfig
