'use client'
import { useState } from 'react'

export function useLeadCapture(options: { origem?: string; produto_interesse?: string } = {}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function capturar(data: Record<string, string>) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...options }),
      })
      if (res.ok) { setSuccess(true) } else { setError('Erro ao enviar.') }
    } catch { setError('Erro de conexão.') }
    setLoading(false)
  }

  return { capturar, loading, success, error }
}
