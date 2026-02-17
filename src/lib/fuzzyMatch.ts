/**
 * VSCode-style fuzzy matching.
 *
 * The algorithm splits the target text into "words" (by spaces, hyphens,
 * underscores, and camelCase boundaries) then greedily matches query
 * characters against word prefixes first, falling back to any character
 * within the current word before advancing to the next word.
 *
 * Example: query "rehe" matches "Bug Report Header"
 *   - words: ["Bug", "Report", "Header"]
 *   - "r" matches start of "Report", "e" continues in "Report"
 *   - "h" matches start of "Header", "e" continues in "Header"
 */

/** Split text into words on spaces, hyphens, underscores, and camelCase */
function tokenize(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → separate words
    .split(/[\s\-_]+/)
    .filter(Boolean)
}

/**
 * Returns true if `query` fuzzy-matches `text` using VSCode-style word-prefix logic.
 */
export function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true
  if (!text) return false

  const q = query.toLowerCase()
  const t = text.toLowerCase()

  // Fast path: simple substring match
  if (t.includes(q)) return true

  // Word-prefix matching
  const words = tokenize(text)
  const lowerWords = words.map((w) => w.toLowerCase())

  return wordPrefixMatch(q, 0, lowerWords, 0)
}

/**
 * Recursively try to consume query chars by matching word prefixes.
 * At each word, we try to match as many leading query chars as possible
 * against the word's prefix, then move on to the next word.
 */
function wordPrefixMatch(
  query: string,
  qi: number,
  words: string[],
  wi: number,
): boolean {
  if (qi >= query.length) return true
  if (wi >= words.length) return false

  const word = words[wi]

  // Try matching 0..N chars from query against the start of this word
  // We try longest match first for better greedy behavior, then fall back
  let maxChars = 0
  for (let i = 0; i < word.length && qi + i < query.length; i++) {
    if (word[i] === query[qi + i]) {
      maxChars = i + 1
    } else {
      break
    }
  }

  // Try each possible consumption length from longest to 0
  for (let take = maxChars; take >= 1; take--) {
    if (wordPrefixMatch(query, qi + take, words, wi + 1)) {
      return true
    }
  }

  // Skip this word entirely
  return wordPrefixMatch(query, qi, words, wi + 1)
}

/**
 * Compute a match score (higher = better). Returns 0 if no match.
 *
 * Scoring factors:
 * - Exact match bonus
 * - Consecutive character bonus
 * - Word-start bonus
 * - Position bonus (earlier matches score higher)
 */
export function fuzzyScore(query: string, text: string): number {
  if (!query) return 0
  if (!text) return 0

  const q = query.toLowerCase()
  const t = text.toLowerCase()

  if (!fuzzyMatch(query, text)) return 0

  // Exact match — highest score
  if (q === t) return 10000

  // Compute character-level score by greedily matching query in text
  let score = 0
  let qi = 0
  let prevMatchIdx = -2
  const wordStarts = computeWordStarts(text)

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Base point for a match
      score += 1

      // Consecutive bonus (strong — favors contiguous runs)
      if (ti === prevMatchIdx + 1) {
        score += 8
      }

      // Word-start bonus
      if (wordStarts.has(ti)) {
        score += 10
      }

      // Position bonus (earlier matches are better)
      score += Math.max(0, 5 - ti)

      prevMatchIdx = ti
      qi++
    }
  }

  // Ratio bonus: how much of the text the query covers
  score += (q.length / t.length) * 10

  return score
}

/** Compute the set of indices that are word-start positions */
function computeWordStarts(text: string): Set<number> {
  const starts = new Set<number>()
  if (text.length > 0) starts.add(0)

  for (let i = 1; i < text.length; i++) {
    const prev = text[i - 1]
    const curr = text[i]
    if (
      prev === ' ' || prev === '-' || prev === '_' ||
      (/[a-z]/.test(prev) && /[A-Z]/.test(curr))
    ) {
      starts.add(i)
    }
  }
  return starts
}
