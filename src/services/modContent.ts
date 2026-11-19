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
