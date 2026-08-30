interface LayoutProps {
    children: React.ReactNode
}

export default function SpecialLayout({ children }: LayoutProps) {
    return (
        <div>
            <div>{children}</div>
        </div>
    )
}
