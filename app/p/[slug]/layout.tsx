import Footer from "@/components/layout/footer"

interface LayoutProps {
    children: React.ReactNode
}

export default function ProductLayout({ children }: LayoutProps) {
    return (
        <div className="mt-5 sm:mt-10 md:mt-20">
            {children}
            <Footer />
        </div>
    )
}
