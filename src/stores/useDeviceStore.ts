import { create } from 'zustand'
import { db } from '@/lib/db'
import type { DevicePreset } from '@/types'

const DEFAULT_PRESETS: Omit<DevicePreset, 'id'>[] = [
  { name: 'iPhone 16', width: 393, height: 852, radius: 48, isBuiltIn: true },
  {
    name: 'iPhone 16 Pro Max',
    width: 430,
    height: 932,
    radius: 55,
    isBuiltIn: true,
  },
  {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    radius: 18,
    isBuiltIn: true,
  },
  {
    name: 'Desktop 1440×900',
    width: 1440,
    height: 900,
    radius: 0,
    isBuiltIn: true,
  },
  {
    name: 'Desktop 1920×1080',
    width: 1920,
    height: 1080,
    radius: 0,
    isBuiltIn: true,
  },
]

interface DeviceStoreState {
  devices: DevicePreset[]
  loaded: boolean
  loadDevices: () => Promise<void>
  addDevice: (
    preset: Omit<DevicePreset, 'id' | 'isBuiltIn'>,
  ) => Promise<void>
  updateDevice: (
    id: number,
    partial: Partial<Omit<DevicePreset, 'id' | 'isBuiltIn'>>,
  ) => Promise<void>
  removeDevice: (id: number) => Promise<void>
}

export const useDeviceStore = create<DeviceStoreState>((set) => ({
  devices: [],
  loaded: false,

  loadDevices: async () => {
    const count = await db.devices.count()
    if (count === 0) {
      await db.devices.bulkAdd(DEFAULT_PRESETS as DevicePreset[])
    }
    const devices = await db.devices.toArray()
    set({ devices, loaded: true })
  },

  addDevice: async (preset) => {
    const device: Omit<DevicePreset, 'id'> = { ...preset, isBuiltIn: false }
    await db.devices.add(device as DevicePreset)
    const devices = await db.devices.toArray()
    set({ devices })
  },

  updateDevice: async (id, partial) => {
    await db.devices.update(id, partial)
    const devices = await db.devices.toArray()
    set({ devices })
  },

  removeDevice: async (id) => {
    const device = await db.devices.get(id)
    if (device?.isBuiltIn) return
    await db.devices.delete(id)
    const devices = await db.devices.toArray()
    set({ devices })
  },
}))
