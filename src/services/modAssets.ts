import { DEFAULT_MOD_VISUALS, getRepositoryOwner } from '../config/site'
import type { ModDefinition, ModVisuals, ThemeInput, ThemePayload } from '../types/mods'

const DEFAULT_ASSETS_BRANCH = 'pages-assets'
const DEFAULT_THEME_JSON_PATH = 'theme.json'

interface ParsedThemePayload {
    images: {
        thumbnail?: string
        banner?: string
    }
    themeVars: Record<string, string> | null
}

interface PagesAssetsResolved {
    branch: string
    themeJsonPath: string
    thumbnailPath: string | null
    bannerPath: string | null
}

const visualCache = new Map<string, Promise<ModVisuals>>()

function isObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isHexColor(value: unknown): value is string {
    return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
}

function encodePath(path: string): string {
    return path
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/')
}

function buildRawGitHubUrl(owner?: string | null, repo?: string | null, branch?: string | null, path?: string | null): string | null {
    if (!owner || !repo || !branch || !path) {
        return null
    }

    return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${encodePath(path)}`
}

function toThemeVars(theme?: ThemeInput | null): Record<string, string> | null {
    if (!isObject(theme)) {
        return null
    }

    const vars: Record<string, string> = {}

    if (isHexColor(theme.accent)) {
        vars['--mods-accent'] = theme.accent.trim()
    }

    if (typeof theme.gradientStart === 'string' && theme.gradientStart.trim()) {
        vars['--mods-gradient-start'] = theme.gradientStart.trim()
    }

    if (typeof theme.gradientEnd === 'string' && theme.gradientEnd.trim()) {
        vars['--mods-gradient-end'] = theme.gradientEnd.trim()
    }

    if (typeof theme.panelLight === 'string' && theme.panelLight.trim()) {
        vars['--mods-panel-light'] = theme.panelLight.trim()
    }

    if (typeof theme.panelDark === 'string' && theme.panelDark.trim()) {
        vars['--mods-panel-dark'] = theme.panelDark.trim()
    }

    if (typeof theme.bannerGlow === 'string' && theme.bannerGlow.trim()) {
        vars['--mods-banner-glow'] = theme.bannerGlow.trim()
    }

    return Object.keys(vars).length > 0 ? vars : null
}

function mergeTheme(
    baseThemeVars: Record<string, string> | null,
    incomingThemeVars: Record<string, string> | null,
): Record<string, string> {
    return {
        ...(baseThemeVars || {}),
        ...(incomingThemeVars || {}),
    }
}

function readThemePayload(payload: ThemePayload | null | undefined): ParsedThemePayload | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const schemaVersion = payload.schemaVersion ?? payload.version ?? 1

    if (schemaVersion !== 1) {
        return null
    }

    return {
        images: isObject(payload.images)
            ? {
                thumbnail:
                    typeof payload.images.thumbnail === 'string' ? payload.images.thumbnail : undefined,
                banner: typeof payload.images.banner === 'string' ? payload.images.banner : undefined,
            }
            : {},
        themeVars: toThemeVars(payload.theme),
    }
}

async function fetchThemeJson(url: string): Promise<ParsedThemePayload | null> {
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
        throw new Error(`Theme JSON request failed (${response.status})`)
    }

    const payload = (await response.json()) as ThemePayload
    return readThemePayload(payload)
}

function getPagesAssetsConfig(mod: ModDefinition): PagesAssetsResolved {
    const config = isObject(mod.pagesAssets) ? mod.pagesAssets : {}
    return {
        branch: typeof config.branch === 'string' ? config.branch : DEFAULT_ASSETS_BRANCH,
        themeJsonPath:
            typeof config.themeJsonPath === 'string' ? config.themeJsonPath : DEFAULT_THEME_JSON_PATH,
        thumbnailPath: typeof config.thumbnailPath === 'string' ? config.thumbnailPath : null,
        bannerPath: typeof config.bannerPath === 'string' ? config.bannerPath : null,
    }
}

function buildVisualsFallback(mod: ModDefinition, pagesAssetsConfig: PagesAssetsResolved): ModVisuals {
    const owner = getRepositoryOwner(mod)
    const { repo } = mod.repository || {}
    const defaultThemeVars = toThemeVars(DEFAULT_MOD_VISUALS.theme)

    return {
        thumbnailImage:
            mod.thumbnailImage ||
            buildRawGitHubUrl(owner, repo, pagesAssetsConfig.branch, pagesAssetsConfig.thumbnailPath) ||
            DEFAULT_MOD_VISUALS.thumbnailImage,
        bannerImage:
            mod.bannerImage ||
            buildRawGitHubUrl(owner, repo, pagesAssetsConfig.branch, pagesAssetsConfig.bannerPath) ||
            DEFAULT_MOD_VISUALS.bannerImage,
        themeVars: defaultThemeVars,
    }
}

export async function fetchModVisuals(mod: ModDefinition): Promise<ModVisuals> {
    if (!mod) {
        throw new Error('A mod configuration is required to fetch visuals.')
    }

    const owner = getRepositoryOwner(mod)
    const { repo } = mod.repository || {}
    const pagesAssets = getPagesAssetsConfig(mod)
    const fallback = buildVisualsFallback(mod, pagesAssets)

    if (!owner || !repo) {
        return fallback
    }

    const themeJsonUrl = buildRawGitHubUrl(owner, repo, pagesAssets.branch, pagesAssets.themeJsonPath)

    if (!themeJsonUrl) {
        return fallback
    }

    try {
        const parsed = await fetchThemeJson(themeJsonUrl)

        if (!parsed) {
            return fallback
        }

        const thumbnailImage =
            buildRawGitHubUrl(
                owner,
                repo,
                pagesAssets.branch,
                parsed.images.thumbnail || pagesAssets.thumbnailPath,
            ) || fallback.thumbnailImage

        const bannerImage =
            buildRawGitHubUrl(
                owner,
                repo,
                pagesAssets.branch,
                parsed.images.banner || pagesAssets.bannerPath,
            ) || fallback.bannerImage

        return {
            thumbnailImage,
            bannerImage,
            themeVars: mergeTheme(fallback.themeVars, parsed.themeVars),
        }
    } catch {
        return fallback
    }
}

export function getModVisuals(mod: ModDefinition): Promise<ModVisuals | null> {
    if (!mod?.slug) {
        return Promise.resolve(null)
    }

    if (!visualCache.has(mod.slug)) {
        visualCache.set(mod.slug, fetchModVisuals(mod))
    }

    return visualCache.get(mod.slug) ?? Promise.resolve(null)
}

export function clearModVisualsCache(): void {
    visualCache.clear()
}
