/**
 * Transform relative markdown links in HTML to internal library file routes
 */
export function transformLibraryLinks(html: string, librarySlug: string): string {
    if (!html) return html

    // Create a temporary container to parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Find all links
    const links = doc.querySelectorAll('a[href]')

    links.forEach((link) => {
        const href = link.getAttribute('href')
        if (!href) return

        // Skip external links and anchors
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
            return
        }

        // Transform relative markdown links to internal routes
        // Examples: docs/guide.md → /library/slug/file/docs/guide
        //           ../other.md → /library/slug/file/../other
        //           guide.md → /library/slug/file/guide
        const transformedHref = `/library/${librarySlug}/file/${href}`
        link.setAttribute('href', transformedHref)
    })

    // Serialize back to HTML
    return doc.documentElement.innerHTML
}
