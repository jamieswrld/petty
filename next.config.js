/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        domains: ['images.pexels.com', 'avatars.githubusercontent.com'],
    },
}

module.exports = nextConfig
