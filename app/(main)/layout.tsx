import Menu from "@/components/layout/menu"
import Footer from "@/components/layout/footer"

interface LayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
    return (
        <div className="mt-8">
            <div>
                <Menu />
            </div>
            <div>{children}</div>
            <div>
                <Footer />
            </div>
        </div>
    )
}
