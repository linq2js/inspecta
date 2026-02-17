import { fuzzyMatch, fuzzyScore } from './fuzzyMatch'

describe('fuzzyMatch', () => {
  describe('basic substring matching', () => {
    it('should match exact strings', () => {
      expect(fuzzyMatch('bug', 'bug')).toBe(true)
    })

    it('should match case-insensitively', () => {
      expect(fuzzyMatch('BUG', 'Bug Report Header')).toBe(true)
    })

    it('should match simple substrings', () => {
      expect(fuzzyMatch('report', 'Bug Report Header')).toBe(true)
    })
  })

  describe('VSCode-style word prefix matching', () => {
    it('should match "rehe" against "Report Header" (re→Report, he→Header)', () => {
      expect(fuzzyMatch('rehe', 'Bug Report Header')).toBe(true)
    })

    it('should match "bugrehe" against "Bug Report Header"', () => {
      expect(fuzzyMatch('bugrehe', 'Bug Report Header')).toBe(true)
    })

    it('should match "brh" against "Bug Report Header" (initials)', () => {
      expect(fuzzyMatch('brh', 'Bug Report Header')).toBe(true)
    })

    it('should match "bh" against "Bug Report Header"', () => {
      expect(fuzzyMatch('bh', 'Bug Report Header')).toBe(true)
    })

    it('should match "refreq" against "Refactor Request"', () => {
      expect(fuzzyMatch('refreq', 'Refactor Request')).toBe(true)
    })

    it('should match "addcon" against "Additional Context"', () => {
      expect(fuzzyMatch('addcon', 'Additional Context')).toBe(true)
    })

    it('should match "ac" against "Additional Context" (initials)', () => {
      expect(fuzzyMatch('ac', 'Additional Context')).toBe(true)
    })
  })

  describe('camelCase and special separator matching', () => {
    it('should match across camelCase boundaries', () => {
      expect(fuzzyMatch('bure', 'bugReport')).toBe(true)
    })

    it('should match across hyphenated words', () => {
      expect(fuzzyMatch('bure', 'bug-report-header')).toBe(true)
    })

    it('should match across underscored words', () => {
      expect(fuzzyMatch('bure', 'bug_report_header')).toBe(true)
    })
  })

  describe('non-matches', () => {
    it('should not match when query chars are not present', () => {
      expect(fuzzyMatch('xyz', 'Bug Report Header')).toBe(false)
    })

    it('should not match when word prefix order is wrong', () => {
      expect(fuzzyMatch('heb', 'Bug Report Header')).toBe(false)
    })

    it('should not match partial that skips required chars', () => {
      expect(fuzzyMatch('zrh', 'Bug Report Header')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should return true for empty query', () => {
      expect(fuzzyMatch('', 'anything')).toBe(true)
    })

    it('should return false for empty text with non-empty query', () => {
      expect(fuzzyMatch('a', '')).toBe(false)
    })

    it('should handle single character query', () => {
      expect(fuzzyMatch('b', 'Bug Report')).toBe(true)
      expect(fuzzyMatch('z', 'Bug Report')).toBe(false)
    })
  })
})

describe('fuzzyScore', () => {
  it('should score exact matches highest', () => {
    const exact = fuzzyScore('bug', 'bug')
    const partial = fuzzyScore('bug', 'Bug Report Header')
    expect(exact).toBeGreaterThan(partial!)
  })

  it('should score prefix matches higher than mid-word matches', () => {
    const prefix = fuzzyScore('bug', 'Bug Report')
    const mid = fuzzyScore('ug', 'Bug Report')
    expect(prefix!).toBeGreaterThan(mid!)
  })

  it('should return 0 for non-matches', () => {
    expect(fuzzyScore('xyz', 'Bug Report Header')).toBe(0)
  })

  it('should return higher score for consecutive matches', () => {
    const consecutive = fuzzyScore('rep', 'Report Header')
    const split = fuzzyScore('reh', 'Report Header')
    expect(consecutive!).toBeGreaterThan(split!)
  })

  it('should score word-start matches higher', () => {
    const wordStart = fuzzyScore('re', 'Bug Report')
    const midWord = fuzzyScore('ep', 'Bug Report')
    expect(wordStart!).toBeGreaterThan(midWord!)
  })
})
