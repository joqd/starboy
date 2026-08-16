// ---------------------------------------------------------------------------
// Small line-icon set shared by mobile-home.tsx and desktop-home.tsx — the
// arrow used on "view all" links/CTAs, and the four brand-values icons
// (shipping, guarantee, returns, support). Kept as plain inline SVG rather
// than an icon library dependency, matching how the rest of the home
// components are written.
// ---------------------------------------------------------------------------

export function ArrowIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
            <path
                d="M12 4 4 12M4 12H11M4 12V5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function TruckIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
            <path
                d="M2 7h11v9H2V7ZM13 10h4l4 3.5V16h-8v-6Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
            />
            <circle cx="6.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    )
}

export function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
            <path
                d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
            />
            <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function RefreshIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
            <path
                d="M4 12a8 8 0 0 1 13.66-5.66L20 8M20 12a8 8 0 0 1-13.66 5.66L4 16"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20 4v4h-4M4 20v-4h4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function HeadsetIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
            <path
                d="M4 13v-1a8 8 0 0 1 16 0v1"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            <rect
                x="3"
                y="13"
                width="4"
                height="6"
                rx="1.3"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <rect
                x="17"
                y="13"
                width="4"
                height="6"
                rx="1.3"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <path
                d="M19 19v.5a3 3 0 0 1-3 3h-2.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </svg>
    )
}
