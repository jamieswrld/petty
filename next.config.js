/** @type {import('next').NextConfig} */
const isStaticExport = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
    ...(isStaticExport ? { output: 'export' } : {}),
    images: {
        unoptimized: true,
        domains: ['images.pexels.com', 'avatars.githubusercontent.com'],
    },
}

module.exports = nextConfig
