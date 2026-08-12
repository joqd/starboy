import Image from "next/image"
import Link from "next/link"
import parse, { domToReact, Element, type HTMLReactParserOptions } from "html-react-parser"
import sanitizeHtml from "sanitize-html"
import { InlineProductSlot } from "./inline-product-slot"

// ---------------------------------------------------------------------------
// Renders the post body — content_html is real HTML from the backend, so
// this sanitizes it (never trust HTML from an API as safe-by-default) and
// re-parses it into React elements, replacing each tag with a version
// styled to match the shop's tokens (border-border, muted-foreground, card)
// instead of relying on a generic "prose" theme.
//
// Requires: html-react-parser, sanitize-html
// (npm i html-react-parser sanitize-html). No "use client" — this renders
// fully on the server, which is what keeps the article text crawlable.
//
// The sanitized HTML is split on top-level <h2> tags into standalone
// sections, each parsed separately, with an <InlineProductSlot> optionally
// dropped between two of them. This splitting is the whole trick for
// "insert related products smartly": it turns "put a product strip
// somewhere inside a wall of HTML" into "put a component between two array
// items," so nothing about this file needs to change again when related
// products go from mock to real — only shouldInsertSlot's placement
// heuristic might.
// ---------------------------------------------------------------------------

export function PostContent({ content, postSlug }: { content: string; postSlug: string }) {
    const sanitized = sanitizeContent(content)
    const sections = splitIntoSections(sanitized)

    return (
        <div className="post-content">
            {sections.map((section, idx) => (
                <div key={idx}>
                    {parse(section, parserOptions)}
                    {shouldInsertSlot(idx, sections.length) && (
                        <InlineProductSlot postSlug={postSlug} />
                    )}
                </div>
            ))}
        </div>
    )
}

function sanitizeContent(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: [
            "p",
            "h2",
            "h3",
            "h4",
            "ul",
            "ol",
            "li",
            "a",
            "img",
            "blockquote",
            "code",
            "pre",
            "hr",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "strong",
            "b",
            "em",
            "i",
            "br",
            "span",
        ],
        allowedAttributes: {
            a: ["href"],
            img: ["src", "alt"],
            "*": ["id"],
        },
        allowedSchemes: ["http", "https", "mailto"],
    })
}

function splitIntoSections(html: string): string[] {
    // Split right before every <h2> opening tag, keeping the heading
    // attached to the section it introduces. Anything before the first
    // <h2> (e.g. an intro paragraph with no heading yet) stays its own
    // leading section.
    return html.split(/(?=<h2[\s>])/i).filter((part) => part.trim().length > 0)
}

function shouldInsertSlot(index: number, total: number): boolean {
    // Short posts (under ~4 sections) don't have room to interrupt without
    // it feeling like the whole article is an ad break. Never right after
    // the last section — RelatedProductsSection already closes the piece.
    // Otherwise once every 3 sections keeps long posts from having only a
    // single placement, without stacking slots back to back.
    if (total < 4) return false
    if (index === total - 1) return false
    return (index + 1) % 3 === 0
}

// ---------------------------------------------------------------------------
// Tag overrides, applied recursively via domToReact so nested elements
// (e.g. an <a> inside a <li>) get styled too, not just top-level ones.
// ---------------------------------------------------------------------------
const parserOptions: HTMLReactParserOptions = {
    replace: (node) => {
        if (!(node instanceof Element)) return
        const { name, attribs, children } = node
        const kids = () => domToReact(children as never, parserOptions)

        switch (name) {
            case "h2":
                return (
                    <h2 id={attribs.id} className="mt-8 mb-3 text-lg font-bold text-foreground">
                        {kids()}
                    </h2>
                )
            case "h3":
                return (
                    <h3
                        id={attribs.id}
                        className="mt-6 mb-2 text-base font-semibold text-foreground"
                    >
                        {kids()}
                    </h3>
                )
            case "p":
                return <p className="mb-4 text-sm leading-7 text-foreground/90">{kids()}</p>
            case "a": {
                const href = attribs.href ?? ""
                const isInternal = href.startsWith("/")
                return isInternal ? (
                    <Link
                        href={href}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {kids()}
                    </Link>
                ) : (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {kids()}
                    </a>
                )
            }
            case "img":
                return attribs.src ? (
                    <span className="relative my-5 block aspect-video overflow-hidden rounded-2xl bg-muted">
                        <Image
                            src={attribs.src}
                            alt={attribs.alt ?? ""}
                            fill
                            sizes="(max-width: 768px) 100vw, 720px"
                            className="object-cover"
                        />
                    </span>
                ) : null
            case "ul":
                return (
                    <ul className="mb-4 list-disc space-y-1 pr-5 text-sm leading-7 text-foreground/90">
                        {kids()}
                    </ul>
                )
            case "ol":
                return (
                    <ol className="mb-4 list-decimal space-y-1 pr-5 text-sm leading-7 text-foreground/90">
                        {kids()}
                    </ol>
                )
            case "blockquote":
                return (
                    <blockquote className="my-5 border-r-2 border-border pr-4 text-sm text-muted-foreground italic">
                        {kids()}
                    </blockquote>
                )
            case "code":
                return <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{kids()}</code>
            case "pre":
                return (
                    <pre className="mb-4 overflow-x-auto rounded-xl border border-border bg-muted p-3 text-xs">
                        {kids()}
                    </pre>
                )
            case "hr":
                return <hr className="my-8 border-border" />
            case "table":
                return (
                    <div className="mb-4 overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-sm">{kids()}</table>
                    </div>
                )
            case "th":
                return (
                    <th className="border-b border-border bg-muted px-3 py-2 text-right font-semibold">
                        {kids()}
                    </th>
                )
            case "td":
                return <td className="border-b border-border px-3 py-2">{kids()}</td>
            default:
                return undefined
        }
    },
}
