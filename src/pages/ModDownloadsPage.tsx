import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGitHubLatestReleaseUrl, getRepositoryOwner } from '../config/site'
import { getModBySlug } from '../data/mods'
import { getModVisuals } from '../services/modAssets'
import { fetchLatestRelease } from '../services/releases'
import type { LatestRelease, ModVisuals } from '../types/mods'

interface ReleaseState {
    slug: string | null
    release: LatestRelease | null
    errorMessage: string
}

interface VisualState {
    slug: string | null
    visuals: ModVisuals | null
}

function formatDate(value?: string): string {
    if (!value) {
        return 'Unknown date'
    }

    return new Date(value).toLocaleString()
}

function formatSize(bytes?: number): string | null {
    if (!Number.isFinite(bytes) || !bytes || bytes <= 0) {
        return null
    }

    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex += 1
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export default function ModDownloadsPage() {
    const { slug } = useParams()
    const mod = useMemo(() => getModBySlug(slug), [slug])
    const [releaseState, setReleaseState] = useState<ReleaseState>({
        slug: null,
        release: null,
        errorMessage: '',
    })
    const [visualsState, setVisualsState] = useState<VisualState>({
        slug: null,
        visuals: null,
    })
    const visuals = visualsState.slug === mod?.slug ? visualsState.visuals : null

    useEffect(() => {
        if (!mod) {
            return
        }

        const currentMod = mod

        let cancelled = false

        async function loadVisuals() {
            const nextVisuals = await getModVisuals(currentMod)

            if (!cancelled) {
                setVisualsState({
                    slug: currentMod.slug,
                    visuals: nextVisuals,
                })
            }
        }

        loadVisuals()

        return () => {
            cancelled = true
        }
    }, [mod])

    useEffect(() => {
        if (!visuals?.themeVars) {
            return undefined
        }

        const rootStyle = document.documentElement.style
        const originalValues: Record<string, string> = {}

        Object.entries(visuals.themeVars).forEach(([property, value]) => {
            originalValues[property] = rootStyle.getPropertyValue(property)
            rootStyle.setProperty(property, value)
        })

        return () => {
            Object.entries(originalValues).forEach(([property, value]) => {
                if (value) {
                    rootStyle.setProperty(property, value)
                    return
                }

                rootStyle.removeProperty(property)
            })
        }
    }, [visuals])

    useEffect(() => {
        if (!mod) {
            return
        }

        const currentMod = mod

        let cancelled = false

        async function loadRelease() {
            try {
                const latest = await fetchLatestRelease(currentMod)

                if (!cancelled) {
                    setReleaseState({
                        slug: currentMod.slug,
                        release: latest,
                        errorMessage: '',
                    })
                }
            } catch (error) {
                if (!cancelled) {
                    setReleaseState({
                        slug: currentMod.slug,
                        release: null,
                        errorMessage:
                            error instanceof Error ? error.message : 'Failed to load latest release.',
                    })
                }
            }
        }

        loadRelease()

        return () => {
            cancelled = true
        }
    }, [mod])

    const isCurrentSlugLoaded = releaseState.slug === mod?.slug
    const isLoading = Boolean(mod) && !isCurrentSlugLoaded
    const release = isCurrentSlugLoaded ? releaseState.release : null
    const errorMessage = isCurrentSlugLoaded ? releaseState.errorMessage : ''

    useEffect(() => {
        document.title = mod ? `${mod.name} Downloads` : 'Mod Not Found'
    }, [mod])

    if (!mod) {
        return (
            <section className="container">
                <div className="alert alert-warning">
                    <h1 className="h3 mb-2">Mod not found</h1>
                    <p className="mb-3">No download page was configured for this mod.</p>
                    <Link to="/" className="btn btn-outline-primary">
                        Back to Home
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className="container">
            <Link className="btn btn-link ps-0 mb-2" to="/">
                <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>
                Back to all mods
            </Link>

            <div className="mod-banner mb-4">
                <img src={visuals?.bannerImage || mod.bannerImage} alt={`${mod.name} banner`} />
                <div className="mod-banner-caption">
                    <h1 className="h2 mb-1 fw-bold">{mod.name}</h1>
                    <div className="small">Official download builds</div>
                </div>
            </div>

            <article className="latest-release-card p-4">
                <h2 className="h4 d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-stars" aria-hidden="true"></i>
                    Latest Release
                </h2>

                {isLoading && (
                    <div className="d-flex align-items-center gap-2 text-body-secondary">
                        <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
                        Fetching release details...
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="alert alert-danger mb-0">
                        <p className="mb-2">{errorMessage}</p>
                        <a
                            href={
                                getGitHubLatestReleaseUrl(mod.repository.repo, getRepositoryOwner(mod)) || undefined
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-danger"
                        >
                            Open Latest on GitHub
                        </a>
                    </div>
                )}

                {!isLoading && !errorMessage && release && (
                    <>
                        <p className="mb-1">
                            <strong>{release.name || release.tag || 'Untitled release'}</strong>
                        </p>
                        <p className="text-body-secondary mb-3">Published: {formatDate(release.publishedAt)}</p>

                        <div className="d-flex flex-wrap gap-2 mb-4">
                            {release.releaseUrl && (
                                <a href={release.releaseUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                                    <i className="bi bi-github me-2" aria-hidden="true"></i>
                                    View Release Notes
                                </a>
                            )}
                        </div>

                        <h3 className="h5">Download Assets</h3>
                        {release.assets.length > 0 ? (
                            <ul className="list-group list-group-flush mb-0">
                                {release.assets.map((asset) => (
                                    <li key={asset.id} className="list-group-item px-0 d-flex flex-column flex-md-row gap-2">
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">{asset.name}</div>
                                            {formatSize(asset.size) && (
                                                <div className="small text-body-secondary">{formatSize(asset.size) as string}</div>
                                            )}
                                        </div>
                                        <a
                                            href={asset.downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-outline-primary align-self-start"
                                        >
                                            <i className="bi bi-download me-2" aria-hidden="true"></i>
                                            Download
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mb-0 text-body-secondary">No downloadable assets are attached to this release yet.</p>
                        )}
                    </>
                )}
            </article>

            <aside className="muted-panel p-4 mt-4">
                <h2 className="h5 mb-2">
                    <i className="bi bi-clock-history me-2" aria-hidden="true"></i>
                    Looking for an older build?
                </h2>
                <p className="mb-3 text-body-secondary">
                    Older versions are kept on the release history page so players can pin specific builds.
                </p>
                <a href={mod.oldBuildsUrl || undefined} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">
                    Open Old Builds
                </a>
            </aside>
        </section>
    )
}
