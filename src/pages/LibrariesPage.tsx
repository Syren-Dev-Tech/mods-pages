import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { getLibraries } from '../data/libraries'
import type { LibraryDefinition } from '../types/libraries'

export default function LibrariesPage() {
    usePageTitle('Libraries')
    const [libraries, setLibraries] = useState<LibraryDefinition[]>([])
    const [configError, setConfigError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadLibraries() {
            try {
                const loadedLibraries = await getLibraries()

                if (!cancelled) {
                    setLibraries(loadedLibraries)
                    setConfigError('')
                }
            } catch (error) {
                if (!cancelled) {
                    setLibraries([])
                    setConfigError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to load library repository config.',
                    )
                }
            }
        }

        loadLibraries()

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <section className="container">
            <div className="mb-4">
                <h1 className="display-5 fw-bold mb-2">Minecraft Libraries</h1>
                <p className="lead mb-0">
                    Reusable libraries and utilities for Minecraft development.
                </p>
            </div>

            {configError && (
                <div className="alert alert-warning mb-4" role="alert">
                    {configError}
                </div>
            )}

            <div className="row g-4">
                {libraries.map((library) => (
                    <div className="col-12 col-sm-6 col-lg-4" key={library.slug}>
                        <article className="card h-100 mods-tile">
                            <div className="mods-thumb-wrapper">
                                <img
                                    src="/favicon.svg"
                                    alt={`${library.name} thumbnail`}
                                    className="mods-thumb"
                                />
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h2 className="h4 card-title">{library.name}</h2>
                                <p className="card-text text-body-secondary flex-grow-1">
                                    Open-source library for Minecraft development.
                                </p>
                                <Link className="btn btn-primary mt-3" to={`/libraries/${library.slug}`}>
                                    <i className="bi bi-collection me-2" aria-hidden="true" />
                                    View Library
                                </Link>
                            </div>
                        </article>
                    </div>
                ))}
                {libraries.length === 0 && (
                    <div className="col-12">
                        <div className="alert alert-info mb-0">
                            No libraries are configured yet. Add your first entry in{' '}
                            <code>public/config/library-repositories.json</code>.
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
