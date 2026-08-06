import type { NextConfig } from "next"

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
        unoptimized: process.env.NODE_ENV === "development",
        qualities: [75, 95],
        remotePatterns: [
            {
                protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
                hostname: apiUrl.hostname,
                port: apiUrl.port,
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
