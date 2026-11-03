import { db } from './db'

// Cópia de segurança: sem conta, o progresso só sai do aparelho num arquivo
// que o aluno guarda. Restaurar substitui tudo o que está neste aparelho.

const TABLES = ['profile', 'enrollments', 'attempts', 'errors', 'cards', 'completions', 'studyDays', 'assessments'] as const
type TableName = (typeof TABLES)[number]

export interface Backup {
  app: 'curso-idiomas'
  version: 1
  exportedAt: string
  tables: Record<TableName, unknown[]>
}

export async function exportBackup(): Promise<Backup> {
  const tables = {} as Backup['tables']
  for (const t of TABLES) tables[t] = await db.table(t).toArray()
  return { app: 'curso-idiomas', version: 1, exportedAt: new Date().toISOString(), tables }
}

/** Valida e aplica a cópia numa transação: ou entra tudo, ou nada muda. */
export async function importBackup(data: unknown): Promise<void> {
  const b = data as Partial<Backup> | null
  if (!b || b.app !== 'curso-idiomas' || b.version !== 1 || typeof b.tables !== 'object' || !b.tables) throw new Error('Este arquivo não é uma cópia deste curso.')
  for (const t of TABLES) if (!Array.isArray(b.tables[t])) throw new Error(`Cópia incompleta (falta "${t}").`)
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      await db.table(t).bulkAdd(b.tables![t])
    }
  })
}

export const backupFilename = (date: string) => `curso-idiomas-copia-${date}.json`
