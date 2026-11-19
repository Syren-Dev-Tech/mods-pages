import { getRepositoryOwner } from '../config/site'
import type { ModDefinition } from '../types/mods'

export async function fetchModReadme(
    mod: ModDefinition,
    branch?: string,
): Promise<string> {
    if (!mod) {
        throw new Error('A mod configuration is required to fetch README.')
    }

    const owner = getRepositoryOwner(mod)
    const { repo } = mod.repository

    try {
        // If branch is specified, try it first
        if (branch) {
            // Try GitHub API with ref parameter
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

            // If not found via API, try raw.githubusercontent.com
            if (response.status !== 404) {
                console.warn(`GitHub README API request failed (${response.status}), trying raw.githubusercontent.com`)
            }

            const rawResponse = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
            )

            if (rawResponse.ok) {
                return await rawResponse.text()
            }

            if (rawResponse.status !== 404) {
                console.warn(`GitHub raw content request failed (${rawResponse.status})`)
            }

            // If branch-specific README not found, fall through to default
        }

        // No branch specified or branch-specific not found, use default branch
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/readme`,
            {
                headers: {
                    Accept: 'application/vnd.github.v3.raw',
                },
            },
        )

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

export async function fetchModFile(
    mod: ModDefinition,
    filePath: string,
    branch?: string,
): Promise<string> {
    if (!mod) {
        throw new Error('A mod configuration is required to fetch a file.')
    }

    // Normalize the file path - remove leading slashes
    let normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath

    const owner = getRepositoryOwner(mod)
    const { repo } = mod.repository
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
