const fs = require('fs');
let config = fs.readFileSync('next.config.js', 'utf8');

const securityHeaders = `
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
`;

if (!config.includes('async headers')) {
  config = config.replace('experimental: {', securityHeaders + '\n  experimental: {');
  fs.writeFileSync('next.config.js', config);
}
