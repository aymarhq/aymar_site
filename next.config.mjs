/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Painel interno de criativos: projeto Vercel separado (aymar-criativos), servido em /criativos.
  async rewrites() {
    const origem = process.env.CRIATIVOS_ORIGIN || 'https://aymar-criativos.vercel.app';
    return {
      beforeFiles: [
        { source: '/criativos', destination: `${origem}/criativos` },
        { source: '/criativos/:path*', destination: `${origem}/criativos/:path*` },
      ],
    };
  },
  async headers() {
    return [{
      source: '/legendas/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
    }];
  },
};
export default nextConfig;
