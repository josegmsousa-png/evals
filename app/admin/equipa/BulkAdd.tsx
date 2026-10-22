'use client'
import { useState, useTransition } from 'react'
import { parseContacts } from '@/lib/contacts'
import { bulkAddPeople, type BulkResult } from './actions'

export default function BulkAdd({ teamId, teamName }: { teamId: string; teamName: string }) {
  const [text, setText] = useState('')
  const [role, setRole] = useState<'engineer' | 'admin'>('engineer')
  const [results, setResults] = useState<BulkResult[] | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  const preview = parseContacts(text)

  function submit() {
    startTransition(async () => {
      setResults(await bulkAddPeople(teamId, text, role))
      setText('')
    })
  }

  function copy() {
    const lines = (results ?? []).filter((r) => r.password)
      .map((r) => `${r.name}\t${r.email}\t${r.password}`)
    navigator.clipboard.writeText(['Nome\tEmail\tPalavra-passe temporária', ...lines].join('\n'))
    setCopied(true)
  }

  if (results) {
    const ok = results.filter((r) => r.password)
    return (
      <div className="mt-3 space-y-3">
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Guarda estas palavras-passe agora: <b>só aparecem esta vez</b>. Se alguém a perder, usa “Repor palavra-passe”.
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr><th className="px-3 py-2">Nome</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Palavra-passe</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.email}>
                  <td className="px-3 py-2 whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-2 text-slate-500">{r.email}</td>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">
                    {r.password ?? <span className="font-sans text-red-600">{r.error}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          {ok.length > 0 && <button className="btn-primary" onClick={copy}>{copied ? 'Copiado ✓' : 'Copiar tabela'}</button>}
          <button className="btn-ghost" onClick={() => { setResults(null); setCopied(false) }}>Adicionar mais</button>
        </div>
        <p className="text-xs text-slate-500">“Copiar tabela” cola directamente no Excel.</p>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea className="input font-mono text-xs" rows={5} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={'Cola a lista do Outlook, por exemplo:\n"NUNO LAPA" <NUNO.LAPA@E-REDES.PT>; "MARTA RIBEIRO" <MARTA.RIBEIRO@E-REDES.PT>'} />
      {preview.length > 0 && (
        <ul className="max-h-40 overflow-y-auto rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {preview.map((c) => <li key={c.email}><b className="text-slate-800">{c.name || '(sem nome)'}</b> · {c.email}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value as 'engineer' | 'admin')}>
          <option value="engineer">Engenheiros</option>
          <option value="admin">Administradores da equipa</option>
        </select>
        <button className="btn-primary" disabled={!preview.length || pending} onClick={submit}>
          {pending ? 'A criar…' : `Adicionar ${preview.length || ''} ao ${teamName}`}
        </button>
      </div>
    </div>
  )
}
