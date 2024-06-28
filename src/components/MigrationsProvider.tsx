'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
import * as dagJSON from '@ipld/dag-json'
import { DIDKey } from '@w3ui/react'

export type MigrationSource = 'classic.nft.storage' | 'old.web3.storage'

export interface MigrationConfiguration {
  /** Data source */
  source: MigrationSource
  /** API token for data source */
  token: string
  /** Target space to migrate data to */
  space: DIDKey
}

export interface Migration extends MigrationConfiguration {
  id: string
}

export interface ContextState {
  migrations: Migration[]
}

export interface ContextActions {
  createMigration: (config: MigrationConfiguration) => ({ id: string })
  removeMigration: (id: string) => void
}

export type ContextValue = [
  state: ContextState,
  actions: ContextActions
]

export const MigrationContextDefaultValue: ContextValue = [
  {
    migrations: []
  },
  {
    createMigration: () => { throw new Error('missing provider') },
    removeMigration: () => { throw new Error('missing provider') }
  }
]

export const Context = createContext<ContextValue>(
  MigrationContextDefaultValue
)

export interface ProviderProps {
  children?: ReactNode
}

export function Provider ({ children }: ProviderProps): ReactNode {
  const migrationsStore = new MigrationsStorage()
  const [migrations, setMigrations] = useState(migrationsStore.load())
  const createMigration = (config: MigrationConfiguration) => {
    const { id } = migrationsStore.create(config)
    setMigrations(migrationsStore.load())
    return { id }
  }
  const removeMigration = (id: string) => {
    migrationsStore.remove(id)
    setMigrations(migrationsStore.load())
  }

  return (
    <Context.Provider value={[{ migrations }, { createMigration, removeMigration }]}>
      {children}
    </Context.Provider>
  )
}

export function useMigrations (): ContextValue {
  return useContext(Context)
}

class MigrationsStorage {
  load () {
    if (typeof localStorage === 'undefined') { // in dev there is SSR
      return []
    }
    const ids: string[] = dagJSON.parse(localStorage.getItem('migrations') ?? '[]')
    const migrations: Migration[] = []
    for (const id of ids) {
      try {
        const migration: Migration = dagJSON.parse(localStorage.getItem(`migration.${id}`) ?? '')
        migrations.push(migration)
      } catch (err) {
        console.error(`failed to load migration: ${id}`, err)
      }
    }
    return migrations
  }

  create (config: MigrationConfiguration) {
    const migration: Migration = { id: crypto.randomUUID(), ...config }
    const ids: string[] = dagJSON.parse(localStorage.getItem('migrations') ?? '[]')
    localStorage.setItem(`migration.${migration.id}`, dagJSON.stringify(migration))
    localStorage.setItem('migrations', dagJSON.stringify([...ids, migration.id]))
    return { id: migration.id }
  }

  remove (id: string) {
    const ids: string[] = dagJSON.parse(localStorage.getItem('migrations') ?? '[]')
    localStorage.setItem('migrations', dagJSON.stringify(ids.filter(i => i !== id)))
    localStorage.removeItem(`migration.${id}`)
  }
}
