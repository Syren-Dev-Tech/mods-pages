import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getModBySlug } from '../data/mods'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchModFile } from '../services/modContent'
import { getGitHubRepoUrl, getRepositoryOwner } from '../config/site'
import { parseMarkdown } from '../utils/markdown'
import { transformModLinks } from '../utils/modLinks'
import type { ModDefinition } from '../types/mods'

export default function ModFilePage() {
    const { slug, '*': filePath } = useParams<{ slug?: string; '*'?: string }>()
    const [mod, setMod] = useState<ModDefinition | null>(null)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Set page title based on file/mod loading state
    const pageTitle = loading ? 'Loading...' : filePath ? `${filePath} - ${mod?.name || 'Mod'}` : 'File Not Found'
    usePageTitle(pageTitle)

    useEffect(() => {
        let cancelled = false

        async function loadFile() {
            try {
                setLoading(true)

                // First load the mod
                const loadedMod = await getModBySlug(slug)

                if (cancelled) return

                if (!loadedMod) {
                    setError('Mod not found')
                    setMod(null)
                    return
                }

                setMod(loadedMod)

                // Then load the file
                if (!filePath) {
                    setError('File path not specified')
                    setContent('')
                    return
                }

                const fileContent = await fetchModFile(
                    loadedMod,
                    filePath,
                    loadedMod.versions?.[0]?.branch,
                )

                if (!cancelled) {
                    if (!fileContent) {
                        setError(`File not found: ${filePath}`)
                        setContent('')
                        return
                    }

                    let parsed = parseMarkdown(fileContent)
                    // Transform relative markdown links to internal routes
                    if (parsed && loadedMod.slug) {
                        parsed = transformModLinks(parsed, loadedMod.slug)
                    }
                    setContent(parsed)
                    setError('')
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load file')
                    setMod(null)
                    setContent('')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadFile()

        return () => {
            cancelled = true
        }
    }, [slug, filePath])

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

    if (error || !mod) {
        return (
            <section className="container">
                <div className="mb-4">
                    <Link to="/mods" className="btn btn-outline-primary mb-3">
                        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                        <span>Back to Mods</span>
                    </Link>
                </div>
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error</h4>
                    <p className="mb-0">{error || 'File not found'}</p>
                </div>
            </section>
        )
    }

    const owner = getRepositoryOwner(mod as any)
    const repoUrl = getGitHubRepoUrl(mod.repository.repo, owner)

    return (
        <section className="container">
            <div className="mb-4">
                <div className="d-flex gap-2 mb-3">
                    <Link to="/mods" className="btn btn-outline-primary">
                        <i className="bi bi-download me-2" aria-hidden="true" />
                        Mods
                    </Link>
                    <Link to={`/mods/${mod.slug}`} className="btn btn-outline-primary">
                        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                        {mod.name}
                    </Link>
                </div>

                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <p className="text-body-secondary mb-2">
                            <code>{filePath}</code>
                        </p>
                        <h1 className="display-5 fw-bold mb-2">{mod.name}</h1>
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
            </div>

            <div className="row">
                <div className="col-lg-8 mx-auto">
                    {content ? (
                        <article className="markdown-content muted-panel p-4 rounded-3">
                            <div
                                className="readme-body"
                                dangerouslySetInnerHTML={{
                                    __html: content,
                                }}
                            />
                        </article>
                    ) : (
                        <div className="alert alert-info">
                            <p className="mb-0">File is empty or could not be loaded.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
