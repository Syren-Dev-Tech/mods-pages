import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { SITE_TITLE } from '../config/site'
import ThemeToggle from './ThemeToggle'
import Sidebar from './Sidebar'
import './AppLayout.scss'

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className={`layout-with-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="layout-main-wrapper">
                <header>
                    <nav className="navbar navbar-expand-lg border-bottom mods-navbar sticky-top">
                        <div className="container-fluid">
                            <button
                                className="btn btn-link sidebar-toggle"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                aria-label="Toggle sidebar"
                                title="Toggle navigation"
                            >
                                <i className="bi bi-list" aria-hidden="true" />
                            </button>

                            <Link className="navbar-brand fw-bold" to="/">
                                <i className="bi bi-box me-2" aria-hidden="true" />
                                {SITE_TITLE}
                            </Link>

                            <div className="ms-auto d-flex align-items-center gap-3">
                                <ThemeToggle />
                            </div>
                        </div>
                    </nav>
                </header>

                <main className="mods-main">
                    <Outlet />
                </main>

                <footer className="border-top py-3 mt-5">
                    <div className="container d-flex justify-content-between align-items-center">
                        <small className="text-body-secondary">{SITE_TITLE}</small>
                        <small className="text-body-secondary">Powered by React + Vite + Bootstrap</small>
                    </div>
                </footer>
            </div>
        </div>
    )
}
