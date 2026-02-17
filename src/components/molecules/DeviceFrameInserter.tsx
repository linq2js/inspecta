import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { useImageStore } from '@/stores/useImageStore'
import { generateFrameImage } from '@/lib/deviceFrame'
import { DeviceModal } from './DeviceModal'

export function DeviceFrameInserter() {
  const { devices, loaded, loadDevices } = useDeviceStore()
  const addImage = useImageStore((s) => s.addImage)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!loaded) loadDevices()
  }, [loaded, loadDevices])

  // Auto-select the first device once loaded
  useEffect(() => {
    if (loaded && devices.length > 0 && selectedId === null) {
      setSelectedId(devices[0].id!)
    }
  }, [loaded, devices, selectedId])

  const handleInsert = useCallback(
    (landscape?: boolean) => {
      const device = devices.find((d) => d.id === selectedId)
      if (!device) return
      const target =
        landscape && device.width !== device.height
          ? { ...device, width: device.height, height: device.width }
          : device
      const { dataUrl, width, height } = generateFrameImage(target)
      addImage(dataUrl, { w: width, h: height })
    },
    [devices, selectedId, addImage],
  )

  const selectedDevice = devices.find((d) => d.id === selectedId)
  const isPortrait =
    selectedDevice != null && selectedDevice.height > selectedDevice.width

  if (!loaded) return null

  const builtIn = devices.filter((d) => d.isBuiltIn)
  const custom = devices.filter((d) => !d.isBuiltIn)

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Icon name="devicePhone" size={14} className="text-zinc-400" />
        <select
          className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {builtIn.length > 0 && (
            <optgroup label="Built-in">
              {builtIn.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.width}×{d.height})
                </option>
              ))}
            </optgroup>
          )}
          {custom.length > 0 && (
            <optgroup label="Custom">
              {custom.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.width}×{d.height})
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleInsert()}
          disabled={selectedId === null}
          title="Insert device frame (portrait)"
        >
          Insert
        </Button>
        {isPortrait && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleInsert(true)}
            disabled={selectedId === null}
            title="Insert device frame (landscape)"
          >
            Landscape
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setModalOpen(true)}
          title="Manage device presets"
        >
          <Icon name="cog" size={14} />
        </Button>
      </div>

      {modalOpen && <DeviceModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
