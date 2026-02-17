import { useAnnotationStore } from './useAnnotationStore'

describe('useAnnotationStore', () => {
  beforeEach(() => {
    useAnnotationStore.getState().resetAnnotations()
  })

  it('should have correct initial state', () => {
    const state = useAnnotationStore.getState()
    expect(state.annotations).toEqual([])
    expect(state.selectedItemId).toBeNull()
  })

  it('should add annotations', () => {
    useAnnotationStore.getState().addAnnotation({
      x: 50, y: 100, width: 200, height: 150,
    })
    expect(useAnnotationStore.getState().annotations).toHaveLength(1)
    expect(useAnnotationStore.getState().annotations[0].rect).toEqual({
      x: 50, y: 100, width: 200, height: 150,
    })
  })

  it('should remove annotations', () => {
    useAnnotationStore.getState().addAnnotation({
      x: 50, y: 100, width: 200, height: 150,
    })
    const id = useAnnotationStore.getState().annotations[0].id
    useAnnotationStore.getState().removeAnnotation(id)
    expect(useAnnotationStore.getState().annotations).toHaveLength(0)
  })

  it('should set notes on annotations', () => {
    useAnnotationStore.getState().addAnnotation({
      x: 50, y: 100, width: 200, height: 150,
    })
    const id = useAnnotationStore.getState().annotations[0].id
    useAnnotationStore.getState().setItemNote(id, 'Fix this spacing')
    expect(useAnnotationStore.getState().annotations[0].note).toBe('Fix this spacing')
  })

  describe('undo/redo', () => {
    it('should undo an add annotation', () => {
      useAnnotationStore.getState().addAnnotation({
        x: 10, y: 10, width: 100, height: 100,
      })
      expect(useAnnotationStore.getState().annotations).toHaveLength(1)

      useAnnotationStore.getState().undo()
      expect(useAnnotationStore.getState().annotations).toHaveLength(0)
    })

    it('should redo after undo', () => {
      useAnnotationStore.getState().addAnnotation({
        x: 10, y: 10, width: 100, height: 100,
      })
      useAnnotationStore.getState().undo()
      useAnnotationStore.getState().redo()
      expect(useAnnotationStore.getState().annotations).toHaveLength(1)
    })

    it('canUndo returns false at initial state', () => {
      expect(useAnnotationStore.getState().canUndo()).toBe(false)
    })

    it('canRedo returns false at latest state', () => {
      useAnnotationStore.getState().addAnnotation({
        x: 10, y: 10, width: 100, height: 100,
      })
      expect(useAnnotationStore.getState().canRedo()).toBe(false)
    })
  })

  describe('blur annotations', () => {
    it('should add a blur annotation with kind "blur"', () => {
      useAnnotationStore.getState().addBlurAnnotation({
        x: 50, y: 100, width: 200, height: 150,
      })
      const annotations = useAnnotationStore.getState().annotations
      expect(annotations).toHaveLength(1)
      expect(annotations[0].kind).toBe('blur')
      expect(annotations[0].rect).toEqual({
        x: 50, y: 100, width: 200, height: 150,
      })
      expect(annotations[0].note).toBe('')
    })

    it('should undo/redo blur annotations', () => {
      useAnnotationStore.getState().addBlurAnnotation({
        x: 10, y: 10, width: 100, height: 100,
      })
      expect(useAnnotationStore.getState().annotations).toHaveLength(1)

      useAnnotationStore.getState().undo()
      expect(useAnnotationStore.getState().annotations).toHaveLength(0)

      useAnnotationStore.getState().redo()
      expect(useAnnotationStore.getState().annotations).toHaveLength(1)
      expect(useAnnotationStore.getState().annotations[0].kind).toBe('blur')
    })

    it('should set drawing tool to blur', () => {
      useAnnotationStore.getState().setDrawingTool('blur')
      expect(useAnnotationStore.getState().drawingTool).toBe('blur')
    })
  })

  describe('getUnifiedList', () => {
    it('should return empty list when no items', () => {
      expect(useAnnotationStore.getState().getUnifiedList()).toEqual([])
    })

    it('should index annotations starting from 1', () => {
      useAnnotationStore.getState().addAnnotation({
        x: 10, y: 10, width: 100, height: 100,
      })
      useAnnotationStore.getState().addAnnotation({
        x: 200, y: 200, width: 50, height: 50,
      })

      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(2)
      expect(list[0].index).toBe(1)
      expect(list[1].index).toBe(2)
    })

    it('should preserve indices when an annotation is deleted', () => {
      useAnnotationStore.getState().addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useAnnotationStore.getState().addAnnotation({ x: 20, y: 20, width: 100, height: 100 })
      useAnnotationStore.getState().addAnnotation({ x: 30, y: 30, width: 100, height: 100 })

      const id2 = useAnnotationStore.getState().annotations[1].id
      useAnnotationStore.getState().removeAnnotation(id2)

      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(2)
      expect(list[0].index).toBe(1)
      expect(list[1].index).toBe(3)
    })

    it('should reset indices after clearAnnotations', () => {
      useAnnotationStore.getState().addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useAnnotationStore.getState().addAnnotation({ x: 20, y: 20, width: 100, height: 100 })
      useAnnotationStore.getState().clearAnnotations()

      useAnnotationStore.getState().addAnnotation({ x: 30, y: 30, width: 100, height: 100 })
      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(1)
      expect(list[0].index).toBe(1)
    })

    it('should reset indices after resetAnnotations', () => {
      useAnnotationStore.getState().addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useAnnotationStore.getState().addAnnotation({ x: 20, y: 20, width: 100, height: 100 })
      useAnnotationStore.getState().resetAnnotations()

      useAnnotationStore.getState().addAnnotation({ x: 30, y: 30, width: 100, height: 100 })
      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(1)
      expect(list[0].index).toBe(1)
    })

    it('should not reuse indices after delete and add', () => {
      useAnnotationStore.getState().addAnnotation({ x: 10, y: 10, width: 100, height: 100 })
      useAnnotationStore.getState().addAnnotation({ x: 20, y: 20, width: 100, height: 100 })

      const id2 = useAnnotationStore.getState().annotations[1].id
      useAnnotationStore.getState().removeAnnotation(id2)

      useAnnotationStore.getState().addAnnotation({ x: 30, y: 30, width: 100, height: 100 })
      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(2)
      expect(list[0].index).toBe(1)
      expect(list[1].index).toBe(3)
    })

    it('should label blur annotations as "Blur box"', () => {
      useAnnotationStore.getState().addBlurAnnotation({
        x: 50, y: 100, width: 200, height: 150,
      })
      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(1)
      expect(list[0].kind).toBe('blur')
      expect(list[0].label).toBe('Blur box')
    })

    it('should include blur items in mixed list with correct indices', () => {
      useAnnotationStore.getState().addAnnotation({
        x: 10, y: 10, width: 100, height: 100,
      })
      useAnnotationStore.getState().addBlurAnnotation({
        x: 50, y: 50, width: 80, height: 80,
      })
      useAnnotationStore.getState().addArrowAnnotation({
        x1: 0, y1: 0, x2: 50, y2: 50,
      })

      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list).toHaveLength(3)
      expect(list[0].kind).toBe('box')
      expect(list[0].index).toBe(1)
      expect(list[1].kind).toBe('blur')
      expect(list[1].index).toBe(2)
      expect(list[2].kind).toBe('arrow')
      expect(list[2].index).toBe(3)
    })
  })

  describe('line annotations', () => {
    it('should add a line annotation with kind "line"', () => {
      useAnnotationStore.getState().addLineAnnotation({
        x1: 10, y1: 20, x2: 100, y2: 200,
      })
      const annotations = useAnnotationStore.getState().annotations
      expect(annotations).toHaveLength(1)
      expect(annotations[0].kind).toBe('line')
      expect(annotations[0].arrow).toEqual({
        x1: 10, y1: 20, x2: 100, y2: 200,
      })
    })

    it('should compute bounding rect from line points', () => {
      useAnnotationStore.getState().addLineAnnotation({
        x1: 100, y1: 50, x2: 20, y2: 200,
      })
      const rect = useAnnotationStore.getState().annotations[0].rect
      expect(rect).toEqual({
        x: 20, y: 50, width: 80, height: 150,
      })
    })

    it('should label line annotations as "Line annotation"', () => {
      useAnnotationStore.getState().addLineAnnotation({
        x1: 0, y1: 0, x2: 50, y2: 50,
      })
      const list = useAnnotationStore.getState().getUnifiedList()
      expect(list[0].kind).toBe('line')
      expect(list[0].label).toBe('Line annotation')
    })

    it('should set drawing tool to line', () => {
      useAnnotationStore.getState().setDrawingTool('line')
      expect(useAnnotationStore.getState().drawingTool).toBe('line')
    })

    it('should undo/redo line annotations', () => {
      useAnnotationStore.getState().addLineAnnotation({
        x1: 10, y1: 10, x2: 100, y2: 100,
      })
      expect(useAnnotationStore.getState().annotations).toHaveLength(1)

      useAnnotationStore.getState().undo()
      expect(useAnnotationStore.getState().annotations).toHaveLength(0)

      useAnnotationStore.getState().redo()
      expect(useAnnotationStore.getState().annotations).toHaveLength(1)
      expect(useAnnotationStore.getState().annotations[0].kind).toBe('line')
    })
  })
})
