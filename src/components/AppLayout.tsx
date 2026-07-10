import { Link, NavLink, Outlet } from 'react-router-dom'
import { SITE_TITLE } from '../config/site'
import ThemeToggle from './ThemeToggle'

export default function AppLayout() {
    return (
        <>
            <header>
                <nav className="navbar navbar-expand-lg border-bottom mods-navbar">
                    <div className="container">
                        <Link className="navbar-brand fw-bold" to="/">
                            <i className="bi bi-box me-2" aria-hidden="true"></i>
                            {SITE_TITLE}
                        </Link>
                        <div className="d-flex align-items-center gap-3">
                            <NavLink
                                className={({ isActive }) =>
                                    `text-decoration-none ${isActive ? 'fw-bold text-primary' : 'text-body'}`
                                }
                                to="/"
                            >
                                Home
                            </NavLink>
                            <ThemeToggle />
                        </div>
                    </div>
                </nav>
            </header>

            <main className="mods-main">
                <Outlet />
            </main>

            <footer className="border-top py-3">
                <div className="container d-flex justify-content-between align-items-center">
                    <small className="text-body-secondary">{SITE_TITLE}</small>
                    <small className="text-body-secondary">Powered by React + Vite + Bootstrap</small>
                </div>
            </footer>
        </>
    )
}
