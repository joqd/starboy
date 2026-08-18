import Footer from "@/components/layout/footer"

interface LayoutProps {
    children: React.ReactNode
}

export default function AboutLayout({ children }: LayoutProps) {
    return (
        <div className="mt-8">
            {children}
            <Footer />
        </div>
    )
}
