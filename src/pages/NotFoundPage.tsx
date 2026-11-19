import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
    usePageTitle('Page Not Found')
    return (
        <section className="container">
            <div className="alert alert-secondary">
                <h1 className="h3 mb-2">Page not found</h1>
                <p className="mb-3">This page does not exist in the mod pages project.</p>
                <Link to="/" className="btn btn-primary">
                    Go Home
                </Link>
            </div>
        </section>
    )
}
