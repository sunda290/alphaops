/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  // Propostas privadas: HTML estático em public/<cliente>/index.html, fora do índice de busca.
  async rewrites() {
    return [{ source: '/imports-company', destination: '/imports-company/index.html' }]
  },
  async headers() {
    return [{ source: '/imports-company/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
            { source: '/imports-company', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
}
module.exports = nextConfig
