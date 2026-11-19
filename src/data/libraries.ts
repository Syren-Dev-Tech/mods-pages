import type { LibraryDefinition, LibraryVersion, PublicLibraryConfig, PublicLibraryRepositoryConfig } from '../types/libraries'

const CONFIG_PATH = '/config/library-repositories.json'

let librariesCache: LibraryDefinition[] | null = null

function isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeVersion(entry: unknown): LibraryVersion | null {
    if (!isObject(entry)) {
        return null
    }

    const version = typeof entry.version === 'string' ? entry.version.trim() : ''
    const branch = typeof entry.branch === 'string' ? entry.branch.trim() : ''

    if (!version || !branch) {
        return null
    }

    return { version, branch }
}

function normalizeRepositoryConfig(entry: unknown): PublicLibraryRepositoryConfig | null {
    if (!isObject(entry)) {
        return null
    }

    const repo = typeof entry.repo === 'string' ? entry.repo.trim() : ''
    const prettyName = typeof entry.prettyName === 'string' ? entry.prettyName.trim() : ''

    if (!repo || !prettyName) {
        return null
    }

    const versions = Array.isArray(entry.versions)
        ? entry.versions
            .map((v) => normalizeVersion(v))
            .filter((v): v is LibraryVersion => Boolean(v))
        : undefined

    return {
        repo,
        prettyName,
        versions: versions && versions.length > 0 ? versions : undefined,
    }
}

function toLibraryDefinition(entry: PublicLibraryRepositoryConfig): LibraryDefinition {
    return {
        slug: entry.repo,
        name: entry.prettyName,
        repository: {
            repo: entry.repo,
        },
        versions: entry.versions,
    }
}

export async function getLibraries(): Promise<LibraryDefinition[]> {
    if (librariesCache) {
        return librariesCache
    }

    const response = await fetch(CONFIG_PATH, { cache: 'no-store' })

    if (!response.ok) {
        throw new Error(`Failed to load library repository config (${response.status})`)
    }

    const payload = (await response.json()) as PublicLibraryConfig

    const repositories = Array.isArray(payload.repositories)
        ? payload.repositories
            .map((entry) => normalizeRepositoryConfig(entry))
            .filter((entry): entry is PublicLibraryRepositoryConfig => Boolean(entry))
        : []

    librariesCache = repositories.map((entry) => toLibraryDefinition(entry))
    return librariesCache
}

export async function getLibraryBySlug(slug?: string): Promise<LibraryDefinition | undefined> {
    if (!slug) {
        return undefined
    }

    const libraries = await getLibraries()
    return libraries.find((lib) => lib.slug === slug)
}

export function clearLibrariesCache(): void {
    librariesCache = null
}
