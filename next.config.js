/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure proper build output for Vercel
  output: undefined, // Let Vercel handle output automatically
}

module.exports = nextConfig

