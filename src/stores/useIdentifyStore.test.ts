import { useIdentifyStore } from './useIdentifyStore'

describe('useIdentifyStore', () => {
  beforeEach(() => {
    useIdentifyStore.getState().reset()
  })

  it('should have correct initial state', () => {
    const state = useIdentifyStore.getState()
    expect(state.image).toBeNull()
    expect(state.annotations).toEqual([])
    expect(state.extraPrompt).toBe('')
    expect(state.promptType).toBe('report-issues')
  })

  it('should add annotations with pixel coordinates', () => {
    useIdentifyStore.getState().addAnnotation({
      x: 50,
      y: 100,
      width: 200,
      height: 150,
    })
    expect(useIdentifyStore.getState().annotations).toHaveLength(1)
    expect(useIdentifyStore.getState().annotations[0].rect).toEqual({
      x: 50,
      y: 100,
      width: 200,
      height: 150,
    })
  })

  it('should remove annotations', () => {
    useIdentifyStore.getState().addAnnotation({
      x: 50,
      y: 100,
      width: 200,
      height: 150,
    })
    const ann = useIdentifyStore.getState().annotations[0]
    useIdentifyStore.getState().removeAnnotation(ann.id)
    expect(useIdentifyStore.getState().annotations).toHaveLength(0)
  })

  it('should set notes on annotations', () => {
    useIdentifyStore.getState().addAnnotation({
      x: 50,
      y: 100,
      width: 200,
      height: 150,
    })
    const id = useIdentifyStore.getState().annotations[0].id
    useIdentifyStore.getState().setItemNote(id, 'Fix this spacing')
    expect(useIdentifyStore.getState().annotations[0].note).toBe(
      'Fix this spacing',
    )
  })

  it('should set extra prompt', () => {
    useIdentifyStore.getState().setExtraPrompt('Running on iOS 17')
    expect(useIdentifyStore.getState().extraPrompt).toBe('Running on iOS 17')
  })

  describe('undo/redo', () => {
    it('should undo an add annotation', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      expect(useIdentifyStore.getState().annotations).toHaveLength(1)

      useIdentifyStore.getState().undo()
      expect(useIdentifyStore.getState().annotations).toHaveLength(0)
    })

    it('should redo after undo', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useIdentifyStore.getState().undo()
      expect(useIdentifyStore.getState().annotations).toHaveLength(0)

      useIdentifyStore.getState().redo()
      expect(useIdentifyStore.getState().annotations).toHaveLength(1)
    })

    it('should undo a remove annotation', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      const id = useIdentifyStore.getState().annotations[0].id
      useIdentifyStore.getState().removeAnnotation(id)
      expect(useIdentifyStore.getState().annotations).toHaveLength(0)

      useIdentifyStore.getState().undo()
      expect(useIdentifyStore.getState().annotations).toHaveLength(1)
    })

    it('canUndo returns false when at initial state', () => {
      expect(useIdentifyStore.getState().canUndo()).toBe(false)
    })

    it('canRedo returns false when at latest state', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      expect(useIdentifyStore.getState().canRedo()).toBe(false)
    })
  })

  describe('getUnifiedList', () => {
    it('should return empty list when no items', () => {
      const list = useIdentifyStore.getState().getUnifiedList()
      expect(list).toEqual([])
    })

    it('should index annotations starting from 1', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 200, y: 200, width: 50, height: 50 })

      const list = useIdentifyStore.getState().getUnifiedList()
      expect(list).toHaveLength(2)
      expect(list[0].index).toBe(1)
      expect(list[0].type).toBe('annotation')
      expect(list[1].index).toBe(2)
      expect(list[1].type).toBe('annotation')
    })
  })

  describe('generatePrompt', () => {
    it('should return empty string when no items and no extra prompt', () => {
      expect(useIdentifyStore.getState().generatePrompt()).toBe('')
    })

    it('should always include all annotations in prompt', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 50, y: 100, width: 200, height: 150 })

      const prompt = useIdentifyStore.getState().generatePrompt()
      expect(prompt).toContain('Annotations:')
      expect(prompt).toContain('[1] at (x:50px y:100px')
    })

    it('should generate prompt with notes section', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 50, y: 100, width: 200, height: 150 })
      const id = useIdentifyStore.getState().annotations[0].id
      useIdentifyStore.getState().setItemNote(id, 'Fix this spacing')

      const prompt = useIdentifyStore.getState().generatePrompt()
      expect(prompt).toContain('Notes:')
      expect(prompt).toContain('[1] "Fix this spacing"')
    })

    it('should include extra prompt text', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 50, y: 100, width: 200, height: 150 })
      useIdentifyStore.getState().setExtraPrompt('Running on iOS 17')

      const prompt = useIdentifyStore.getState().generatePrompt()
      expect(prompt).toContain('Additional context')
      expect(prompt).toContain('Running on iOS 17')
    })

    it('should include annotations without notes in annotation list but not notes section', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 200, y: 200, width: 50, height: 50 })

      const id2 = useIdentifyStore.getState().annotations[1].id
      useIdentifyStore.getState().setItemNote(id2, 'Only this one')

      const prompt = useIdentifyStore.getState().generatePrompt()
      // Both annotations appear in the list
      expect(prompt).toContain('[1] at')
      expect(prompt).toContain('[2] at')
      // Only the noted one in the notes section
      expect(prompt).toContain('[2] "Only this one"')
      expect(prompt).not.toContain('[1] "')
    })

    it('should switch prompt type', () => {
      useIdentifyStore
        .getState()
        .addAnnotation({ x: 50, y: 100, width: 200, height: 150 })

      useIdentifyStore.getState().setPromptType('refactor-ui')
      const prompt = useIdentifyStore.getState().generatePrompt()
      expect(prompt).toContain('refactor and improve')
    })
  })
})
