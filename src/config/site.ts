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
    thumbnailImage: '/images/mods/default-thumb.svg',
    bannerImage: '/images/mods/default-banner.svg',
    theme: {
        accent: '#ca7b15',
        gradientStart: 'rgba(202, 123, 21, 0.22)',
        gradientEnd: 'rgba(30, 136, 229, 0.2)',
        panelLight: 'rgba(255, 247, 224, 0.8)',
        panelDark: 'rgba(33, 37, 41, 0.8)',
        bannerGlow:
            'radial-gradient(circle at 20% 20%, rgba(255, 206, 86, 0.45), transparent 40%), radial-gradient(circle at 80% 80%, rgba(30, 136, 229, 0.3), transparent 45%)',
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
