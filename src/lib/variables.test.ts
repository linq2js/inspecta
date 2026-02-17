import {
  extractVariables,
  substituteVariables,
  syncVariablesFromContent,
  validateImportData,
} from './variables'

describe('extractVariables', () => {
  it('should extract unique variable names', () => {
    const content = 'Hello {{name}}, your {{role}} is {{name}}'
    expect(extractVariables(content)).toEqual(['name', 'role'])
  })

  it('should return empty array for no variables', () => {
    expect(extractVariables('Hello world')).toEqual([])
  })

  it('should handle underscores in variable names', () => {
    expect(extractVariables('{{component_name}}')).toEqual(['component_name'])
  })
})

describe('substituteVariables', () => {
  it('should substitute known variables', () => {
    const result = substituteVariables('Hello {{name}}', { name: 'World' })
    expect(result).toBe('Hello World')
  })

  it('should leave unknown variables as-is', () => {
    const result = substituteVariables('Hello {{name}} {{unknown}}', {
      name: 'World',
    })
    expect(result).toBe('Hello World {{unknown}}')
  })

  it('should handle multiple occurrences', () => {
    const result = substituteVariables('{{a}} and {{a}}', { a: 'X' })
    expect(result).toBe('X and X')
  })
})

describe('syncVariablesFromContent', () => {
  it('should create new variables from content', () => {
    const result = syncVariablesFromContent('{{foo}} {{bar}}', [])
    expect(result).toEqual([
      { name: 'foo', description: '', defaultValue: '' },
      { name: 'bar', description: '', defaultValue: '' },
    ])
  })

  it('should preserve existing variable metadata', () => {
    const existing = [
      { name: 'foo', description: 'A foo', defaultValue: 'default_foo' },
    ]
    const result = syncVariablesFromContent('{{foo}} {{bar}}', existing)
    expect(result[0]).toEqual({
      name: 'foo',
      description: 'A foo',
      defaultValue: 'default_foo',
    })
    expect(result[1]).toEqual({
      name: 'bar',
      description: '',
      defaultValue: '',
    })
  })

  it('should remove variables no longer in content', () => {
    const existing = [
      { name: 'old', description: 'old var', defaultValue: '' },
    ]
    const result = syncVariablesFromContent('{{new}}', existing)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('new')
  })
})

describe('validateImportData', () => {
  it('should accept valid data', () => {
    const data = {
      entries: [
        { title: 'Test', content: 'Content', type: 'snippet' },
      ],
    }
    const result = validateImportData(data)
    expect(result.valid).toBe(true)
  })

  it('should reject non-object data', () => {
    const result = validateImportData('not an object')
    expect(result.valid).toBe(false)
  })

  it('should reject missing entries', () => {
    const result = validateImportData({ foo: 'bar' })
    expect(result.valid).toBe(false)
  })

  it('should reject entries without title', () => {
    const result = validateImportData({
      entries: [{ content: 'x', type: 'snippet' }],
    })
    expect(result.valid).toBe(false)
  })

  it('should reject entries with invalid type', () => {
    const result = validateImportData({
      entries: [{ title: 'x', content: 'x', type: 'invalid' }],
    })
    expect(result.valid).toBe(false)
  })
})
