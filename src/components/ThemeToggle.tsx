import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'mods-pages-theme'

function getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === 'light' || stored === 'dark') {
        return stored
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark'

    return (
        <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
        >
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'} me-2`} aria-hidden="true"></i>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
    )
}
