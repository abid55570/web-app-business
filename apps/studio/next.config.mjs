/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing workspace packages.
  transpilePackages: ['@b-dash/schemas', '@b-dash/studio', '@b-dash/wirer'],
}
export default nextConfig
