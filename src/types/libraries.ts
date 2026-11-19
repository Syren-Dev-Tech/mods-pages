export interface LibraryRepository {
    owner?: string
    repo: string
}

export interface LibraryVersion {
    version: string
    branch: string
}

export interface PublicLibraryRepositoryConfig {
    repo: string
    prettyName: string
    versions?: LibraryVersion[]
}

export interface PublicLibraryConfig {
    repositories: PublicLibraryRepositoryConfig[]
}

export interface LibraryDefinition {
    slug: string
    name: string
    repository: LibraryRepository
    versions?: LibraryVersion[]
}
