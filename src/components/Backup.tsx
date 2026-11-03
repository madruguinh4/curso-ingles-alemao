import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { exportBackup, importBackup, backupFilename } from '../lib/backup'
import { download } from '../lib/export'
import { todayISO } from '../lib/dates'
import { requestPersistentStorage } from '../lib/db'
import { Button, Notice } from './ui'

export function BackupDownload() {
  return (
    <Button variant="secondary" block icon={<Download size={18} />}
      onClick={async () => download(backupFilename(todayISO()), JSON.stringify(await exportBackup()), 'application/json')}>
      Baixar cópia do meu progresso
    </Button>
  )
}

/** Escolher o arquivo já restaura; quem chama decide para onde ir depois. */
export function BackupRestore({ onDone, label = 'Restaurar de uma cópia' }: { onDone: () => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()
  async function restore(file: File) {
    setError(undefined)
    try {
      await importBackup(JSON.parse(await file.text()))
      void requestPersistentStorage()
      onDone()
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Este arquivo não é uma cópia deste curso.' : (err as Error).message)
    }
  }
  return (
    <div className="grid gap-2">
      <input ref={input} type="file" accept="application/json,.json" className="hidden" aria-hidden="true" tabIndex={-1}
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) restore(f) }} />
      <Button variant="ghost" block icon={<Upload size={18} />} onClick={() => input.current?.click()}>{label}</Button>
      {error && <Notice kind="warn">{error}</Notice>}
    </div>
  )
}
