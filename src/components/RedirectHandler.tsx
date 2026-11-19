import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

type RedirectHandlerProps = {
    children: React.ReactNode
}

export default function RedirectHandler({ children }: RedirectHandlerProps) {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        // Check if there's a redirect query parameter from 404.html
        const redirectPath = searchParams.get('redirect')
        if (redirectPath) {
            // Navigate to the requested path
            navigate(redirectPath, { replace: true })
        }
    }, [searchParams, navigate])

    return children
}
