/** @type {import('next').NextConfig} */
/** Cloudflare Pages: ビルド `pnpm run build`、出力ディレクトリ `out` */
const nextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "www.autofull.com",
        pathname: "/cdn/shop/**",
      },
    ],
  },
}

export default nextConfig
