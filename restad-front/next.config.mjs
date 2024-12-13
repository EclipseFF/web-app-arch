/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'resources.restad.kz',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            }
        ]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb',
        }
    }
};
export default nextConfig
