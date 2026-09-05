import "./globals.css"
import { ThemeProvider } from "@/components/common/theme-provider"
import { cn } from "@/lib/utils"
import { AmbientGlow } from "@/components/layout/ambient-glow"
import localFont from "next/font/local"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toast"
import { ViewTransitions } from "next-view-transitions"

const MainFont = localFont({
    src: "./assets/fonts/YekanBakh-Bold.woff2",
    variable: "--font-main",
    display: "swap",
})

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
})

type RootLayoutProps = {
    children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn("antialiased", "font-sans", MainFont.className)}
        >
            <head>
                <link rel="icon" href="/favicon/red.svg" media="(prefers-color-scheme: light)" />
                <link rel="icon" href="/favicon/golden.svg" media="(prefers-color-scheme: dark)" />
            </head>
            <body className={`${inter.variable}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AmbientGlow />

                    <AuthProvider>
                        <ViewTransitions>{children}</ViewTransitions>
                    </AuthProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
