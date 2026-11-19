import type { ModDefinition, ThemeInput } from '../types/mods'

export const ORGANIZATION_NAME = 'syren-dev-tech'
export const ORGANIZATION_DISPLAY_NAME = 'Syren Dev Tech'
export const SITE_TITLE = 'Syren Dev Tech | Minecraft Mods'

interface DefaultModVisuals {
    thumbnailImage: string
    bannerImage: string
    theme: ThemeInput
}

export const DEFAULT_MOD_VISUALS: DefaultModVisuals = {
    thumbnailImage: '/favicon.svg',
    bannerImage: '/favicon.svg',
    theme: {
        gradientStart: 'rgba(0, 255, 105, 0.15)',
        gradientEnd: 'rgba(0, 105, 255, 0.15)',
        panelLight: 'rgba(230, 245, 255, 0.8)',
        panelDark: 'rgba(20, 30, 50, 0.8)',
        bannerGlow:
            'radial-gradient(circle at 20% 20%, rgba(0, 255, 105, 0.3), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0, 105, 255, 0.25), transparent 45%)',
    },
}

export function getRepositoryOwner(mod?: Pick<ModDefinition, 'repository'> | null): string {
    return mod?.repository?.owner || ORGANIZATION_NAME
}

export function getGitHubRepoUrl(repo?: string | null, owner = ORGANIZATION_NAME): string | null {
    if (!repo) {
        return null
    }

    return `https://github.com/${owner}/${repo}`
}

export function getGitHubReleasesUrl(repo?: string | null, owner = ORGANIZATION_NAME): string | null {
    const repoUrl = getGitHubRepoUrl(repo, owner)
    return repoUrl ? `${repoUrl}/releases` : null
}

export function getGitHubLatestReleaseUrl(repo?: string | null, owner = ORGANIZATION_NAME): string | null {
    const releasesUrl = getGitHubReleasesUrl(repo, owner)
    return releasesUrl ? `${releasesUrl}/latest` : null
}
