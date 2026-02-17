import Dexie, { type EntityTable } from 'dexie'
import type { PromptEntry, Folder, Tag, DevicePreset } from '@/types'

class PromptDB extends Dexie {
  entries!: EntityTable<PromptEntry, 'id'>
  tags!: EntityTable<Tag, 'id'>
  folders!: EntityTable<Folder, 'id'>
  devices!: EntityTable<DevicePreset, 'id'>

  constructor() {
    super('prompt-assistant')
    this.version(1).stores({
      entries:
        '++id, type, title, *tags, folderId, isBuiltIn, createdAt, updatedAt',
      tags: '++id, &name',
      folders: '++id, name, type',
    })
    this.version(2).stores({
      entries:
        '++id, type, title, *tags, folderId, isBuiltIn, createdAt, updatedAt',
      tags: '++id, &name',
      folders: '++id, name, type',
      devices: '++id, name, isBuiltIn',
    })
  }
}

export const db = new PromptDB()
