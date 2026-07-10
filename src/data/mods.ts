import { getGitHubReleasesUrl } from '../config/site'
import type { ModDefinition, PublicModConfig, PublicModRepositoryConfig } from '../types/mods'

const CONFIG_PATH = '/config/mod-repositories.json'

let modsCache: ModDefinition[] | null = null

function isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeRepositoryConfig(entry: unknown): PublicModRepositoryConfig | null {
    if (!isObject(entry)) {
        return null
    }

    const repo = typeof entry.repo === 'string' ? entry.repo.trim() : ''
    const prettyName = typeof entry.prettyName === 'string' ? entry.prettyName.trim() : ''

    if (!repo || !prettyName) {
        return null
    }

    return { repo, prettyName }
}

function toModDefinition(entry: PublicModRepositoryConfig): ModDefinition {
    return {
        slug: entry.repo,
        name: entry.prettyName,
        description: `Official downloads for ${entry.prettyName}.`,
        repository: {
            repo: entry.repo,
        },
        pagesAssets: {
            branch: 'pages-assets',
            themeJsonPath: 'theme.json',
        },
        oldBuildsUrl: getGitHubReleasesUrl(entry.repo),
    }
}

export async function getMods(): Promise<ModDefinition[]> {
    if (modsCache) {
        return modsCache
    }

    const response = await fetch(CONFIG_PATH, { cache: 'no-store' })

    if (!response.ok) {
        throw new Error(`Failed to load mod repository config (${response.status})`)
    }

    const payload = (await response.json()) as PublicModConfig

    const repositories = Array.isArray(payload.repositories)
        ? payload.repositories
            .map((entry) => normalizeRepositoryConfig(entry))
            .filter((entry): entry is PublicModRepositoryConfig => Boolean(entry))
        : []

    modsCache = repositories.map((entry) => toModDefinition(entry))
    return modsCache
}

export async function getModBySlug(slug?: string): Promise<ModDefinition | undefined> {
    if (!slug) {
        return undefined
    }

    const mods = await getMods()
    return mods.find((mod) => mod.slug === slug)
}

export function clearModsCache(): void {
    modsCache = null
}
