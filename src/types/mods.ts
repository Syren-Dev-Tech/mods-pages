export interface ModRepository {
    owner?: string
    repo: string
}

export interface PagesAssetsConfig {
    branch?: string
    themeJsonPath?: string
    thumbnailPath?: string
    bannerPath?: string
}

export interface ModDefinition {
    slug: string
    name: string
    description: string
    repository: ModRepository
    pagesAssets?: PagesAssetsConfig
    oldBuildsUrl?: string | null
    latestReleaseJson?: string
    thumbnailImage?: string
    bannerImage?: string
}

export interface ThemeInput {
    accent?: string
    gradientStart?: string
    gradientEnd?: string
    panelLight?: string
    panelDark?: string
    bannerGlow?: string
}

export interface ThemePayload {
    schemaVersion?: number
    version?: number
    images?: {
        thumbnail?: string
        banner?: string
    }
    theme?: ThemeInput
}

export interface ModVisuals {
    thumbnailImage: string
    bannerImage: string
    themeVars: Record<string, string> | null
}

export interface ReleaseAsset {
    id: string | number
    name: string
    downloadUrl: string
    size?: number
}

export interface LatestRelease {
    name?: string
    tag?: string
    publishedAt?: string
    releaseUrl?: string
    assets: ReleaseAsset[]
}
