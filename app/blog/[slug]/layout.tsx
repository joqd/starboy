interface LayoutProps {
    children: React.ReactNode
}

export default function BlogDetailLayout({ children }: LayoutProps) {
    return <div className="mt-8">{children}</div>
}
