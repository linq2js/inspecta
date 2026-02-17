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
  })
})
