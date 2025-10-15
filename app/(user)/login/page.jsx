import { Suspense } from "react"
import LoginPageContent, { LoadingState } from "./LoginPageContent"

export const dynamic = "force-dynamic"

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <LoginPageContent />
        </Suspense>
    )
}
