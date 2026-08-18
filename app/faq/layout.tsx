import Footer from "@/components/layout/footer"

interface LayoutProps {
	children: React.ReactNode
}

export default function FaqLayout({ children }: LayoutProps) {
	return (
		<div className="mt-8">
			{children}
			<Footer />
		</div>
	)
}
