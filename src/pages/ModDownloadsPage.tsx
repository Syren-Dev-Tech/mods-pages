import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGitHubLatestReleaseUrl, getRepositoryOwner } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'
import { getModBySlug } from '../data/mods'
import { getModVisuals } from '../services/modAssets'
import { fetchReleases } from '../services/releases'
import { fetchModReadme } from '../services/modContent'
import { parseMarkdown } from '../utils/markdown'
import type { LatestRelease, ModDefinition, ModVisuals } from '../types/mods'

interface ReleaseState {
    slug: string | null
    releases: LatestRelease[]
    selectedReleaseIndex: number
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
    const [mod, setMod] = useState<ModDefinition | null>(null)
    const [isModLoading, setIsModLoading] = useState(true)
    const [releaseState, setReleaseState] = useState<ReleaseState>({
        slug: null,
        releases: [],
        selectedReleaseIndex: 0,
        errorMessage: '',
    })
    const [visualsState, setVisualsState] = useState<VisualState>({
        slug: null,
        visuals: null,
    })
    const [readme, setReadme] = useState('')
    const [readmeLoading, setReadmeLoading] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState<string | undefined>()
    const visuals = visualsState.slug === mod?.slug ? visualsState.visuals : null

    // Set page title based on mod loading state
    let pageTitle = 'Mod Not Found'
    if (isModLoading) {
        pageTitle = 'Loading Mod...'
    } else if (mod) {
        pageTitle = `${mod.name} Downloads`
    }
    usePageTitle(pageTitle)

    useEffect(() => {
        let cancelled = false

        async function loadMod() {
            setIsModLoading(true)

            try {
                const loadedMod = await getModBySlug(slug)

                if (!cancelled) {
                    setMod(loadedMod ?? null)
                    // Initialize selectedVersion with first version if available
                    if (loadedMod?.versions && loadedMod.versions.length > 0) {
                        setSelectedVersion(loadedMod.versions[0].branch)
                    } else {
                        setSelectedVersion(undefined)
                    }
                }
            } finally {
                if (!cancelled) {
                    setIsModLoading(false)
                }
            }
        }

        loadMod().catch(console.error)

        return () => {
            cancelled = true
        }
    }, [slug])

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

        loadVisuals().catch(console.error)

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

        async function loadReadme() {
            try {
                setReadmeLoading(true)
                const readmeContent = await fetchModReadme(currentMod, selectedVersion)

                if (!cancelled) {
                    const parsed = readmeContent ? parseMarkdown(readmeContent) : ''
                    setReadme(parsed)
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load README:', err)
                    setReadme('')
                }
            } finally {
                if (!cancelled) {
                    setReadmeLoading(false)
                }
            }
        }

        loadReadme().catch(console.error)

        return () => {
            cancelled = true
        }
    }, [mod, selectedVersion])

    useEffect(() => {
        if (!mod) {
            return
        }

        const currentMod = mod

        let cancelled = false

        async function loadRelease() {
            try {
                const releases = await fetchReleases(currentMod, 10)

                if (!cancelled) {
                    setReleaseState({
                        slug: currentMod.slug,
                        releases: releases,
                        selectedReleaseIndex: 0,
                        errorMessage: '',
                    })
                }
            } catch (error) {
                if (!cancelled) {
                    setReleaseState({
                        slug: currentMod.slug,
                        releases: [],
                        selectedReleaseIndex: 0,
                        errorMessage:
                            error instanceof Error ? error.message : 'Failed to load releases.',
                    })
                }
            }
        }

        loadRelease().catch(console.error)

        return () => {
            cancelled = true
        }
    }, [mod])

    const isCurrentSlugLoaded = releaseState.slug === mod?.slug
    const isLoading = Boolean(mod) && !isCurrentSlugLoaded
    const release = isCurrentSlugLoaded && releaseState.releases.length > 0
        ? releaseState.releases[releaseState.selectedReleaseIndex]
        : null
    const errorMessage = isCurrentSlugLoaded ? releaseState.errorMessage : ''

    if (isModLoading) {
        return (
            <section className="container">
                <div className="d-flex align-items-center gap-2 text-body-secondary">
                    <output className="spinner-border spinner-border-sm" aria-hidden="true" />
                    <span>Loading mod configuration...</span>
                </div>
            </section>
        )
    }

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
                <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                <span>Back to all mods</span>
            </Link>

            <div className="mod-banner mb-4">
                <img src={visuals?.bannerImage || mod.bannerImage || '/favicon.svg'} alt={`${mod.name} banner`} />
                <div className="mod-banner-caption">
                    <h1 className="h2 mb-1 fw-bold">{mod.name}</h1>
                    <div className="small">Official download builds</div>
                </div>
            </div>

            {mod.versions && mod.versions.length > 0 && (
                <div className="mb-4">
                    <label htmlFor="versionSelect" className="form-label">
                        Minecraft Version:
                    </label>
                    <select
                        id="versionSelect"
                        className="form-select"
                        value={selectedVersion || ''}
                        onChange={(e) => setSelectedVersion(e.target.value || undefined)}
                    >
                        {mod.versions.map((v) => (
                            <option key={v.branch} value={v.branch}>
                                {v.version}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <article className="latest-release-card p-4">
                <div className="d-flex justify-content-between align-items-center gap-3 mb-3 flex-wrap">
                    <h2 className="h4 d-flex align-items-center gap-2 mb-0">
                        <i className="bi bi-stars" aria-hidden="true" />
                        <span>Available Releases</span>
                    </h2>
                    {!isLoading && releaseState.releases.length > 1 && (
                        <div className="flex-shrink-0">
                            <select
                                className="form-select form-select-sm"
                                value={releaseState.selectedReleaseIndex}
                                onChange={(e) =>
                                    setReleaseState({
                                        ...releaseState,
                                        selectedReleaseIndex: Number.parseInt(e.target.value, 10)
                                    })
                                }
                            >
                                {releaseState.releases.map((rel, index) => (
                                    <option key={rel.assets[0].id} value={index}>
                                        {rel.name || rel.tag || 'Release ' + (index + 1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="d-flex align-items-center gap-2 text-body-secondary">
                        <output className="spinner-border spinner-border-sm" aria-hidden="true" />
                        <span>Fetching release details...</span>
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
                                    <i className="bi bi-github me-2" aria-hidden="true" />
                                    <span>View Release Notes</span>
                                </a>
                            )}
                        </div>

                        <h3 className="h5 mb-3">Download Assets</h3>
                        {release.assets.length > 0 ? (
                            <div className="row g-2 mb-0">
                                {release.assets.map((asset) => (
                                    <div key={asset.id} className="col-12">
                                        <div className="download-item p-3 rounded-2 d-flex align-items-center justify-content-between gap-3">
                                            <div className="flex-grow-1 min-width-0">
                                                <div className="fw-semibold text-truncate">{asset.name}</div>
                                                {formatSize(asset.size) && (
                                                    <div className="small text-body-secondary mt-1">
                                                        <i className="bi bi-file-earmark me-1" aria-hidden="true"></i>
                                                        {formatSize(asset.size)}
                                                    </div>
                                                )}
                                            </div>
                                            <a
                                                href={asset.downloadUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-primary btn-sm flex-shrink-0"
                                            >
                                                <i className="bi bi-download me-1" aria-hidden="true" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mb-0 text-body-secondary">No downloadable assets are attached to this release yet.</p>
                        )}
                    </>
                )}
            </article>

            {readmeLoading ? (
                <div className="text-center py-5">
                    <output className="spinner-border">
                        <span className="visually-hidden">Loading...</span>
                    </output>
                </div>
            ) : readme && (
                <article className="markdown-content muted-panel p-4 rounded-3 mt-4">
                    <div
                        className="readme-body"
                        dangerouslySetInnerHTML={{
                            __html: readme,
                        }}
                    />
                </article>
            )}

            <aside className="muted-panel p-4 mt-4">
                <h2 className="h5 mb-2">
                    <i className="bi bi-clock-history me-2" aria-hidden="true" />
                    <span>Looking for an older build?</span>
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
