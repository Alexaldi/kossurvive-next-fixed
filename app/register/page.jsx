import { Suspense } from "react"
import RegisterPageContent, { LoadingState } from "./RegisterPageContent"

export const dynamic = "force-dynamic"

export default function RegisterPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <RegisterPageContent />
        </Suspense>
    )
}
