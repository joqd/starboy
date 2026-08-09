import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
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
    async redirects() {
        return [
            {
                source: "/p",
                destination: "/",
                permanent: true,
            },
        ]
    },
}

export default nextConfig
