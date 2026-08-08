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
                // port: 443
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
