import { useImageStore } from './useImageStore'

describe('useImageStore', () => {
  beforeEach(() => {
    useImageStore.getState().resetImages()
  })

  it('should have correct initial state', () => {
    const state = useImageStore.getState()
    expect(state.images).toEqual([])
    expect(state.canvasBounds.totalWidth).toBe(0)
    expect(state.selectedLayerId).toBeNull()
  })

  it('should add an image at origin', () => {
    useImageStore.getState().addImage('data:image/png;base64,test', { w: 100, h: 200 })
    const state = useImageStore.getState()
    expect(state.images).toHaveLength(1)
    expect(state.images[0].dimensions).toEqual({ w: 100, h: 200 })
    expect(state.images[0].x).toBe(0)
    expect(state.images[0].y).toBe(0)
    expect(state.canvasBounds.totalWidth).toBe(100)
    expect(state.canvasBounds.totalHeight).toBe(200)
  })

  it('should offset new images from the last layer', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    useImageStore.getState().addImage('data:b', { w: 150, h: 100 })
    const state = useImageStore.getState()
    expect(state.images).toHaveLength(2)
    expect(state.images[1].x).toBe(20)
    expect(state.images[1].y).toBe(20)
  })

  it('should remove an image', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    const id = useImageStore.getState().images[0].id
    useImageStore.getState().removeImage(id)
    expect(useImageStore.getState().images).toHaveLength(0)
  })

  it('should clear selectedLayerId when removing the selected layer', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    const id = useImageStore.getState().images[0].id
    useImageStore.getState().setSelectedLayer(id)
    expect(useImageStore.getState().selectedLayerId).toBe(id)
    useImageStore.getState().removeImage(id)
    expect(useImageStore.getState().selectedLayerId).toBeNull()
  })

  it('should move a layer and clamp to >= 0', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    const id = useImageStore.getState().images[0].id
    useImageStore.getState().moveLayer(id, 50, 30)
    expect(useImageStore.getState().images[0].x).toBe(50)
    expect(useImageStore.getState().images[0].y).toBe(30)

    useImageStore.getState().moveLayer(id, -10, -20)
    expect(useImageStore.getState().images[0].x).toBe(0)
    expect(useImageStore.getState().images[0].y).toBe(0)
  })

  it('should reorder layers', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    useImageStore.getState().addImage('data:b', { w: 150, h: 100 })
    useImageStore.getState().addImage('data:c', { w: 80, h: 80 })
    const ids = useImageStore.getState().images.map((img) => img.id)

    // Move last to first
    useImageStore.getState().reorderLayer(ids[2], 0)
    const reordered = useImageStore.getState().images.map((img) => img.id)
    expect(reordered).toEqual([ids[2], ids[0], ids[1]])
  })

  it('should select and deselect a layer', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    const id = useImageStore.getState().images[0].id
    useImageStore.getState().setSelectedLayer(id)
    expect(useImageStore.getState().selectedLayerId).toBe(id)
    useImageStore.getState().setSelectedLayer(null)
    expect(useImageStore.getState().selectedLayerId).toBeNull()
  })

  it('should undo adding an image', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    expect(useImageStore.getState().images).toHaveLength(1)

    useImageStore.getState().undoImage()
    expect(useImageStore.getState().images).toHaveLength(0)
  })

  it('should redo after undo', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    useImageStore.getState().undoImage()
    expect(useImageStore.getState().images).toHaveLength(0)

    useImageStore.getState().redoImage()
    expect(useImageStore.getState().images).toHaveLength(1)
  })

  it('should reset all images', () => {
    useImageStore.getState().addImage('data:a', { w: 100, h: 200 })
    useImageStore.getState().addImage('data:b', { w: 150, h: 100 })
    useImageStore.getState().resetImages()
    const state = useImageStore.getState()
    expect(state.images).toEqual([])
    expect(state.canvasBounds.totalWidth).toBe(0)
    expect(state.selectedLayerId).toBeNull()
  })
})
