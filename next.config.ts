import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "examples.motion.dev",
            },
        ],
    },
}

export default nextConfig
