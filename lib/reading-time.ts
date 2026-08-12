// Rough estimate only — good enough for a "X دقیقه مطالعه" chip, not meant
// to be exact. Word-count based rather than character-based since the
// content is Persian/English mixed and character counts skew hard depending
// on which language a given post leans toward. Tags are stripped first
// since content_html is real HTML — otherwise attribute values and tag
// names would get counted as "words" and inflate the estimate.
export function estimateReadingTime(html: string, wordsPerMinute = 200): number {
    const text = html.replace(/<[^>]+>/g, " ")
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / wordsPerMinute))
}
