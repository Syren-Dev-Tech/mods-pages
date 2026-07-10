import type { ModDefinition } from '../types/mods'

export const mods: ModDefinition[] = []

export function getModBySlug(slug?: string): ModDefinition | undefined {
    return mods.find((mod) => mod.slug === slug)
}
