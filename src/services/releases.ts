import { getRepositoryOwner } from '../config/site'
import type { LatestRelease, ModDefinition, ReleaseAsset } from '../types/mods'

interface GitHubAssetPayload {
    id?: string | number
    name?: string
    downloadUrl?: string
    browser_download_url?: string
    size?: number
}

interface ReleasePayload {
    name?: string
    tag?: string
    tag_name?: string
    publishedAt?: string
    published_at?: string
    releaseUrl?: string
    html_url?: string
    assets?: GitHubAssetPayload[]
}

function normalizeReleasePayload(payload: ReleasePayload | null | undefined): LatestRelease | null {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const assets: ReleaseAsset[] = []

    if (Array.isArray(payload.assets)) {
        payload.assets.forEach((asset) => {
            const name = asset.name || 'download'
            const downloadUrl = asset.downloadUrl ?? asset.browser_download_url

            if (!downloadUrl) {
                return
            }

            assets.push({
                id: asset.id ?? name,
                name,
                downloadUrl,
                size: asset.size,
            })
        })
    }

    return {
        name: payload.name || payload.tag || payload.tag_name,
        tag: payload.tag || payload.tag_name,
        publishedAt: payload.publishedAt || payload.published_at,
        releaseUrl: payload.releaseUrl || payload.html_url,
        assets,
    }
}

async function fetchFromGitHubApi(owner: string, repo: string): Promise<LatestRelease | null> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: {
            Accept: 'application/vnd.github+json',
        },
    })

    if (!response.ok) {
        throw new Error(`GitHub latest release request failed (${response.status})`)
    }

    const payload = (await response.json()) as ReleasePayload
    return normalizeReleasePayload(payload)
}

export async function fetchLatestRelease(mod: ModDefinition): Promise<LatestRelease | null> {
    if (!mod) {
        throw new Error('A mod configuration is required to fetch releases.')
    }

    const owner = getRepositoryOwner(mod)
    const { repo } = mod.repository
    return fetchFromGitHubApi(owner, repo)
}
