import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        unoptimized: process.env.NODE_ENV === "development",
		qualities: [75, 95],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
            },
        ],
    },
}

export default nextConfig
