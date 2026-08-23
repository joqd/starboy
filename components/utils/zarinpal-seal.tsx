"use client"

import { useEffect } from "react"

export default function ZarinpalSeal() {
    useEffect(() => {
        const container = document.getElementById("zarinpal")

        if (!container) return

        if (container.querySelector("script")) return

        const script = document.createElement("script")
        script.src = "https://www.zarinpal.com/webservice/TrustCode"
        script.type = "text/javascript"

        container.appendChild(script)

        return () => {
            container.innerHTML = ""
        }
    }, [])

    return <div id="zarinpal" className="flex h-20 w-20 items-center justify-center" />
}
