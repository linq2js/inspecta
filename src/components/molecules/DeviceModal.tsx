import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { useDeviceStore } from '@/stores/useDeviceStore'
import type { DevicePreset } from '@/types'

interface DeviceModalProps {
  onClose: () => void
}

interface FormState {
  name: string
  width: string
  height: string
  radius: string
}

const emptyForm: FormState = { name: '', width: '', height: '', radius: '0' }

export function DeviceModal({ onClose }: DeviceModalProps) {
  const { devices, addDevice, updateDevice, removeDevice } = useDeviceStore()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const builtIn = devices.filter((d) => d.isBuiltIn)
  const custom = devices.filter((d) => !d.isBuiltIn)

  const validate = (): boolean => {
    if (!form.name.trim()) {
      setError('Name is required')
      return false
    }
    const w = Number(form.width)
    const h = Number(form.height)
    if (!w || w <= 0 || !h || h <= 0) {
      setError('Width and height must be positive numbers')
      return false
    }
    const r = Number(form.radius)
    if (isNaN(r) || r < 0) {
      setError('Radius must be 0 or a positive number')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const preset = {
      name: form.name.trim(),
      width: Number(form.width),
      height: Number(form.height),
      radius: Number(form.radius),
    }

    if (editingId !== null) {
      await updateDevice(editingId, preset)
    } else {
      await addDevice(preset)
    }

    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (device: DevicePreset) => {
    setEditingId(device.id!)
    setForm({
      name: device.name,
      width: String(device.width),
      height: String(device.height),
      radius: String(device.radius),
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this device preset?')) return
    await removeDevice(id)
    if (editingId === id) cancelEdit()
  }

  const renderRow = (device: DevicePreset) => (
    <tr
      key={device.id}
      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
    >
      <td className="py-2 pr-3 text-sm text-zinc-800 dark:text-zinc-200">
        {device.name}
        {device.isBuiltIn && (
          <span className="ml-1.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            built-in
          </span>
        )}
      </td>
      <td className="py-2 pr-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
        {device.width}×{device.height}
      </td>
      <td className="py-2 pr-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
        {device.radius}
      </td>
      <td className="py-2 text-right">
        {!device.isBuiltIn && (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startEdit(device)}
              title="Edit"
            >
              <Icon name="pencilSquare" size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(device.id!)}
              title="Delete"
            >
              <Icon name="trash" size={12} />
            </Button>
          </div>
        )}
      </td>
    </tr>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Device Presets
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="x" size={16} />
          </Button>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage device frames you can insert onto the canvas.
        </p>

        {/* Device table */}
        <div className="mt-4 max-h-60 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 dark:border-zinc-700">
                <th className="pb-2 pr-3">Name</th>
                <th className="pb-2 pr-3">Size</th>
                <th className="pb-2 pr-3">Radius</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {builtIn.map(renderRow)}
              {custom.map(renderRow)}
            </tbody>
          </table>
          {devices.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-400">
              No device presets yet.
            </p>
          )}
        </div>

        {/* Add / Edit form */}
        <form onSubmit={handleSubmit} className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {editingId !== null ? 'Edit Device' : 'Add Custom Device'}
          </p>

          <div className="grid grid-cols-[1fr_80px_80px_60px] gap-2">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            />
            <input
              type="number"
              placeholder="Width"
              min={1}
              value={form.width}
              onChange={(e) =>
                setForm((f) => ({ ...f, width: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            />
            <input
              type="number"
              placeholder="Height"
              min={1}
              value={form.height}
              onChange={(e) =>
                setForm((f) => ({ ...f, height: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            />
            <input
              type="number"
              placeholder="r"
              min={0}
              value={form.radius}
              onChange={(e) =>
                setForm((f) => ({ ...f, radius: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            />
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}

          <div className="mt-3 flex gap-2">
            <Button type="submit" variant="primary" size="sm">
              <Icon name="plus" size={14} />
              {editingId !== null ? 'Update' : 'Add'}
            </Button>
            {editingId !== null && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
