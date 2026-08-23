import Footer from "@/components/layout/footer"

interface LayoutProps {
    children: React.ReactNode
}

export default function ProductsLayout({ children }: LayoutProps) {
    return (
        <div className="mt-18">
            {children}
            <Footer />
        </div>
    )
}
