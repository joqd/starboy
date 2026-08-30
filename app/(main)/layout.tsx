import FloatingMenu from "@/components/layout/floating-menu"
import Footer from "@/components/layout/footer"

interface LayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
    return (
        <div className="mt-8">
            <div>
                <FloatingMenu />
            </div>
            <div>{children}</div>
            <div>
                <Footer />
            </div>
        </div>
    )
}
