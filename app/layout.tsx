import "./globals.css"
import { ThemeProvider } from "@/components/common/theme-provider"
import { cn } from "@/lib/utils"
import { AmbientGlow } from "@/components/layout/ambient-glow"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toast"
import { ViewTransitions } from "next-view-transitions"

type RootLayoutProps = {
    children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("antialiased")}>
            <head>
                <link rel="icon" href="/favicon/red.svg" media="(prefers-color-scheme: light)" />
                <link rel="icon" href="/favicon/golden.svg" media="(prefers-color-scheme: dark)" />
            </head>
            <body>
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
