'use client'
import { useState } from 'react'

export default function LeadForm({ origem = 'landing_page', produto = 'consultoria', ctaText = '→ Enviar', showFields = ['nome','email','telefone'] }: { origem?: string, produto?: string, ctaText?: string, showFields?: string[] }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', empresa: '', setor: '', mensagem: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, origem, produto_interesse: produto }),
      })
      if (res.ok) { setSuccess(true) } else { setError('Erro ao enviar. Tente novamente.') }
    } catch { setError('Erro de conexão.') }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', background: '#131312', border: '1px solid #2a2a27', color: '#ede9e0', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: '0.05em', padding: '14px 16px', outline: 'none', marginBottom: 12 }
  const btnStyle: React.CSSProperties = { width: '100%', fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#000', background: '#7bc85a', border: 'none', padding: '18px 24px', cursor: 'pointer', marginTop: 4 }

  if (success) return <div style={{ padding: 24, border: '1px solid #3d6b2e', background: 'rgba(61,107,46,0.08)', textAlign: 'center' }}><p style={{ color: '#7bc85a', fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Recebido.</p><p style={{ color: '#8a8880', fontSize: 13 }}>Entro em contato em até 24h.</p></div>

  return (
    <form onSubmit={handleSubmit}>
      {showFields.includes('nome') && <input style={inputStyle} type="text" placeholder="Seu nome" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required />}
      {showFields.includes('email') && <input style={inputStyle} type="email" placeholder="Seu e-mail" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />}
      {showFields.includes('telefone') && <input style={inputStyle} type="tel" placeholder="WhatsApp (opcional)" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} />}
      {showFields.includes('empresa') && <input style={inputStyle} type="text" placeholder="Empresa" value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} />}
      {error && <p style={{ color: '#c03030', fontSize: 11, fontFamily: 'monospace', marginBottom: 8 }}>{error}</p>}
      <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Enviando...' : ctaText}</button>
      <p style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 9, color: '#8a8880', textAlign: 'center', letterSpacing: '0.08em' }}>Sem spam. Dados não compartilhados.</p>
    </form>
  )
}
