import { useEffect } from 'react'
import { ORGANIZATION_DISPLAY_NAME } from '../config/site'

/**
 * Custom hook to set the document title for the current page.
 * Automatically appends the organization name if not already present.
 * @param title - The title for the current page
 */
export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = title.includes(ORGANIZATION_DISPLAY_NAME)
            ? title
            : `${title} - ${ORGANIZATION_DISPLAY_NAME}`
    }, [title])
}
