import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost', // Whitelist your local Laravel server
                port: '8000',
                pathname: '/storage/**', // Allow any image inside the storage folder
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1', // Whitelist the IP version just in case
                port: '8000',
                pathname: '/storage/**',
            }
        ],
    },
};

export default nextConfig;