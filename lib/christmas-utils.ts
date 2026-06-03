/**
 * Utility to check if we should display Christmas theme
 * Christmas season: December 1st - December 26th
 */
export function isChristmasSeason(): boolean {
    const now = new Date()
    const month = now.getMonth() // 0-11, where 11 is December
    const day = now.getDate() // 1-31

    // Christmas theme permanently disabled
    return false
}
