import { getRepositoryOwner } from '../config/site'
import type { LibraryDefinition } from '../types/libraries'

export async function fetchLibraryReadme(
    library: LibraryDefinition,
    branch?: string,
): Promise<string> {
    if (!library) {
        throw new Error('A library configuration is required to fetch README.')
    }

    const owner = getRepositoryOwner(library as any)
    const { repo } = library.repository

    try {
        // Try GitHub API with ref parameter if branch is specified
        if (branch) {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/readme?ref=${encodeURIComponent(branch)}`,
                {
                    headers: {
                        Accept: 'application/vnd.github.v3.raw',
                    },
                },
            )

            if (response.ok) {
                return await response.text()
            }

            if (response.status !== 404) {
                throw new Error(`GitHub README request failed (${response.status})`)
            }

            // If not found, fall back to raw.githubusercontent.com
            const rawResponse = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
            )

            if (rawResponse.ok) {
                return await rawResponse.text()
            }

            if (rawResponse.status !== 404) {
                throw new Error(`GitHub raw content request failed (${rawResponse.status})`)
            }

            return ''
        }

        // No branch specified, use default branch
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
            headers: {
                Accept: 'application/vnd.github.v3.raw',
            },
        })

        if (!response.ok) {
            if (response.status === 404) {
                return ''
            }
            throw new Error(`GitHub README request failed (${response.status})`)
        }

        return await response.text()
    } catch (error) {
        console.error(`Failed to fetch README for ${repo}:`, error)
        return ''
    }
}

export async function fetchLibraryFile(
    library: LibraryDefinition,
    filePath: string,
    branch?: string,
): Promise<string> {
    if (!library) {
        throw new Error('A library configuration is required to fetch a file.')
    }

    // Normalize the file path - remove leading slashes
    let normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath

    const owner = getRepositoryOwner(library as any)
    const { repo } = library.repository
    const branchToUse = branch || 'main'

    try {
        // Try the path as-is first
        const rawResponse = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branchToUse}/${normalizedPath}`,
        )

        if (rawResponse.ok) {
            return await rawResponse.text()
        }

        // If file has no extension and wasn't found, try adding .md
        if (!normalizedPath.includes('.') && rawResponse.status === 404) {
            const mdResponse = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${branchToUse}/${normalizedPath}.md`,
            )

            if (mdResponse.ok) {
                return await mdResponse.text()
            }
        }

        // Try alternate branch names if main doesn't work
        if (rawResponse.status === 404) {
            for (const altBranch of ['master', 'default']) {
                if (altBranch === branchToUse) continue

                const altResponse = await fetch(
                    `https://raw.githubusercontent.com/${owner}/${repo}/${altBranch}/${normalizedPath}`,
                )

                if (altResponse.ok) {
                    return await altResponse.text()
                }

                // Also try with .md if no extension
                if (!normalizedPath.includes('.')) {
                    const altMdResponse = await fetch(
                        `https://raw.githubusercontent.com/${owner}/${repo}/${altBranch}/${normalizedPath}.md`,
                    )

                    if (altMdResponse.ok) {
                        return await altMdResponse.text()
                    }
                }
            }
        }

        return ''
    } catch (error) {
        console.error(`Failed to fetch file ${filePath} from ${repo}:`, error)
        return ''
    }
}
