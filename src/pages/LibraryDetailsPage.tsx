import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLibraryBySlug } from '../data/libraries'
import { fetchLibraryReadme } from '../services/libraryContent'
import { getGitHubRepoUrl, getRepositoryOwner } from '../config/site'
import { parseMarkdown } from '../utils/markdown'
import { transformLibraryLinks } from '../utils/libraryLinks'
import type { LibraryDefinition } from '../types/libraries'

export default function LibraryDetailsPage() {
    const { slug } = useParams<{ slug?: string }>()
    const [library, setLibrary] = useState<LibraryDefinition | null>(null)
    const [readme, setReadme] = useState('')
    const [selectedVersion, setSelectedVersion] = useState<string | undefined>()
    const [selectedVersionLabel, setSelectedVersionLabel] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [readmeLoading, setReadmeLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadLibrary() {
            try {
                setLoading(true)
                const lib = await getLibraryBySlug(slug)

                if (cancelled) return

                if (!lib) {
                    setError('Library not found')
                    setLibrary(null)
                    return
                }

                setLibrary(lib)
                setError('')

                // Set the initial version if available
                if (lib.versions && lib.versions.length > 0) {
                    setSelectedVersion(lib.versions[0].branch)
                    setSelectedVersionLabel(lib.versions[0].version)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load library')
                    setLibrary(null)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadLibrary()

        return () => {
            cancelled = true
        }
    }, [slug])

    // Separate effect for loading README
    useEffect(() => {
        let cancelled = false

        async function loadReadme() {
            if (!library) return

            try {
                setReadmeLoading(true)
                const readmeContent = await fetchLibraryReadme(library, selectedVersion)

                if (!cancelled) {
                    let parsed = readmeContent ? parseMarkdown(readmeContent) : ''
                    // Transform relative markdown links to internal routes
                    if (parsed && library.slug) {
                        parsed = transformLibraryLinks(parsed, library.slug)
                    }
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

        loadReadme()

        return () => {
            cancelled = true
        }
    }, [library, selectedVersion])

    if (loading) {
        return (
            <section className="container">
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </section>
        )
    }

    if (error || !library) {
        return (
            <section className="container">
                <div className="mb-4">
                    <Link to="/libraries" className="btn btn-outline-primary mb-3">
                        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                        Back to Libraries
                    </Link>
                </div>
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p className="mb-0">{error || 'Library not found'}</p>
                </div>
            </section>
        )
    }

    const owner = getRepositoryOwner(library as any)
    let repoUrl = getGitHubRepoUrl(library.repository.repo, owner)

    // Add branch to repo URL if a specific branch is selected
    if (repoUrl && selectedVersion) {
        repoUrl = `${repoUrl}/tree/${selectedVersion}`
    }

    return (
        <section className="container">
            <div className="mb-4">
                <Link to="/libraries" className="btn btn-outline-primary mb-3">
                    <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                    Back to Libraries
                </Link>

                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h1 className="display-5 fw-bold mb-2">{library.name}</h1>
                    </div>
                    {repoUrl && (
                        <a
                            href={repoUrl ?? ''}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            title="Open on GitHub"
                        >
                            <i className="bi bi-github me-2" aria-hidden="true" />
                            View on GitHub
                        </a>
                    )}
                </div>

                {library.versions && library.versions.length > 0 && (
                    <div className="mb-3">
                        <label htmlFor="versionSelect" className="form-label">
                            Minecraft Version:
                        </label>
                        <select
                            id="versionSelect"
                            className="form-select"
                            value={selectedVersion || ''}
                            onChange={(e) => {
                                const branch = e.target.value
                                setSelectedVersion(branch)
                                // Update the label for the selected version
                                const version = library.versions?.find((v) => v.branch === branch)
                                if (version) {
                                    setSelectedVersionLabel(version.version)
                                }
                            }}
                        >
                            {library.versions.map((v) => (
                                <option key={v.branch} value={v.branch}>
                                    {v.version}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="row">
                <div className="col-lg-8 mx-auto">
                    {readmeLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : readme ? (
                        <article className="markdown-content muted-panel p-4 rounded-3">
                            <div
                                className="readme-body"
                                dangerouslySetInnerHTML={{
                                    __html: readme,
                                }}
                            />
                        </article>
                    ) : (
                        <div className="alert alert-info">
                            <p className="mb-0">
                                No README found for this library{selectedVersionLabel && ` for version ${selectedVersionLabel}`}. Check the{' '}
                                <a href={repoUrl ?? ''} target="_blank" rel="noopener noreferrer">
                                    GitHub repository
                                </a>
                                {' '}for more information.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
