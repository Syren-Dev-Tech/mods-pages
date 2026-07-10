import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ORGANIZATION_NAME } from '../config/site'
import { getMods } from '../data/mods'
import { getModVisuals } from '../services/modAssets'
import type { ModDefinition, ModVisuals } from '../types/mods'

type VisualMap = Record<string, ModVisuals | null>

export default function HomePage() {
    const [mods, setMods] = useState<ModDefinition[]>([])
    const [configError, setConfigError] = useState('')
    const [visualsBySlug, setVisualsBySlug] = useState<VisualMap>({})

    useEffect(() => {
        let cancelled = false

        async function loadVisuals() {
            try {
                const loadedMods = await getMods()

                const entries = await Promise.all(
                    loadedMods.map(async (mod) => {
                        const visuals = await getModVisuals(mod)
                        return [mod.slug, visuals] as const
                    }),
                )

                if (!cancelled) {
                    setMods(loadedMods)
                    setVisualsBySlug(Object.fromEntries(entries))
                    setConfigError('')
                }
            } catch (error) {
                if (!cancelled) {
                    setMods([])
                    setVisualsBySlug({})
                    setConfigError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to load mod repository config.',
                    )
                }
            }
        }

        loadVisuals()

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <section className="container">
            <div className="mb-4">
                <h1 className="display-5 fw-bold mb-2">Minecraft Mod Downloads</h1>
                <p className="lead mb-0">
                    Browse official builds for {ORGANIZATION_NAME} mods and jump directly to release assets.
                </p>
            </div>

            {configError && (
                <div className="alert alert-warning mb-4" role="alert">
                    {configError}
                </div>
            )}

            <div className="row g-4">
                {mods.map((mod) => (
                    <div className="col-12 col-sm-6 col-lg-4" key={mod.slug}>
                        <article className="card h-100 mods-tile">
                            <img
                                src={visualsBySlug[mod.slug]?.thumbnailImage || mod.thumbnailImage}
                                alt={`${mod.name} thumbnail`}
                                className="mods-thumb"
                            />
                            <div className="card-body d-flex flex-column">
                                <h2 className="h4 card-title">{mod.name}</h2>
                                <p className="card-text text-body-secondary flex-grow-1">{mod.description}</p>
                                <Link className="btn btn-primary mt-3" to={`/mods/${mod.slug}`}>
                                    <i className="bi bi-download me-2" aria-hidden="true"></i>
                                    Open Downloads
                                </Link>
                            </div>
                        </article>
                    </div>
                ))}
                {mods.length === 0 && (
                    <div className="col-12">
                        <div className="alert alert-info mb-0">
                            No mods are configured yet. Add your first entry in <code>public/config/mod-repositories.json</code>.
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
