import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
	experimental: {
        optimizeCss: true,
    },
    images: {
        dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
        unoptimized: process.env.NODE_ENV === "development",
        qualities: [75, 95],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.starboy.ir",
            },
            {
                protocol: "https",
                hostname: "c377485.parspack.net",
            },
        ],
    },
}

export default nextConfig
