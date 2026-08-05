import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        unoptimized: process.env.NODE_ENV === "development",
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
            },
        ],
    },
}

export default nextConfig
