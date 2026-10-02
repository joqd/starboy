const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const disallowedPaths = ["/profile", "/orders", "/checkout"]

export async function GET(): Promise<Response> {
    const rules = disallowedPaths.map((path) => `Disallow: ${path}`).join("\n")

    const body = ["User-agent: *", rules, "", `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join("\n")

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
    })
}
