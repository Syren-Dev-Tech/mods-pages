import { NavLink } from 'react-router-dom'
import './Sidebar.scss'

type NavItem = {
    label: string
    path: string
    icon: string
    isComingSoon?: boolean
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Home', path: '/', icon: 'house-fill' },
    { label: 'Mods', path: '/mods', icon: 'box-fill' },
    { label: 'Libraries', path: '/libraries', icon: 'collection-fill' },
]

type SidebarProps = {
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <nav className={`sidebar ${isOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <h3 className="mb-0">Menu</h3>
                    <button
                        className="btn-close"
                        aria-label="Close sidebar"
                        onClick={onClose}
                    />
                </div>

                <ul className="nav nav-pills flex-column gap-1">
                    {NAV_ITEMS.map((item) => (
                        <li className="nav-item" key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center gap-2 ${
                                        isActive ? 'active' : ''
                                    } ${item.isComingSoon ? 'disabled' : ''}`
                                }
                                onClick={item.isComingSoon ? undefined : onClose}
                                aria-disabled={item.isComingSoon}
                            >
                                <i className={`bi bi-${item.icon}`} aria-hidden="true" />
                                <span>{item.label}</span>
                                {item.isComingSoon && (
                                    <span className="badge bg-warning-subtle text-warning-emphasis ms-auto">
                                        Soon
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <hr className="my-3" />

                <div className="sidebar-footer">
                    <small className="text-body-secondary d-block mb-2">
                        More sections coming soon!
                    </small>
                </div>
            </nav>
        </>
    )
}
