'use client'
import { useState, useEffect } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import styles from './ponta.module.css'

export default function PontaDeLanca() {
  const [nicho, setNicho]             = useState('')
  const [nomeLead, setNomeLead]       = useState('')
  const [whatsapp, setWhatsapp]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [copiado, setCopiado]         = useState<string | null>(null)
  const [resultado, setResultado]     = useState<{abordagem:string,cartao:string,roteiro:string} | null>(null)
  const [role, setRole]               = useState<'admin' | 'ponta_de_lanca'>('ponta_de_lanca')
  const [nomeUsuario, setNomeUsuario] = useState('')

  useEffect(() => {
    const match = document.cookie.match(/alphaops-role-pub=([^;]+)/)
    const val = match ? match[1].trim() : ''
    if (val === 'admin') setRole('admin')
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.nome) setNomeUsuario(d.nome) })
      .catch(() => {})
  }, [])

  async function gerar() {
    if (!nicho.trim()) return
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch('/api/ponta-de-lanca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, nomeLead, nomeUsuario }),
      })
      const data = await res.json()
      setResultado(data)
    } catch {
      alert('Erro ao gerar. Tente novamente.')
    }
    setLoading(false)
  }

  function copiar(texto: string, campo: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(campo)
    setTimeout(() => setCopiado(null), 2000)
  }

  function enviarWhatsApp(texto: string) {
    const numero = whatsapp.replace(/\D/g, '')
    if (!numero) { alert('Digite o WhatsApp do lead primeiro.'); return }
    window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(texto), '_blank')
  }

  return (
    <div className={styles.page}>
      <NavInterno role={role} paginaAtual="/ponta-de-lanca" />
      <main className={styles.main}>
        <h1 className={styles.title}>Gerador de<br /><em>Abordagem</em></h1>
        <p className={styles.sub}>Preencha os campos e receba a abordagem pronta para enviar.</p>

        <div className={styles.camposGrid}>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>Nicho do estabelecimento</div>
            <input className={styles.input} type="text"
              placeholder="Ex: restaurante italiano, clinica odontologica..."
              value={nicho} onChange={e => setNicho(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gerar()} />
          </div>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>Nome do lead</div>
            <input className={styles.input} type="text"
              placeholder="Ex: Joao, Maria..."
              value={nomeLead} onChange={e => setNomeLead(e.target.value)} />
          </div>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>WhatsApp do lead (com DDI)</div>
            <input className={styles.input} type="text"
              placeholder="Ex: 5561999999999"
              value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
        </div>

        <button className={styles.btnGerar} onClick={gerar} disabled={loading || !nicho.trim()}>
          {loading ? 'Gerando...' : 'Gerar abordagem'}
        </button>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Gerando abordagem para {nicho}...</span>
          </div>
        )}

        {nomeUsuario && (
          <div className={styles.usuarioInfo}>
            Gerando como: <strong>{nomeUsuario}</strong>
          </div>
        )}

        {resultado && (
          <div className={styles.resultados}>
            {[
              { key: 'abordagem', label: '// Mensagem de abordagem', texto: resultado.abordagem },
              { key: 'cartao',    label: '// Cartao de visita digital', texto: resultado.cartao },
              { key: 'roteiro',   label: '// Roteiro de conversa',     texto: resultado.roteiro },
            ].map(({ key, label, texto }) => (
              <div key={key} className={styles.bloco}>
                <div className={styles.blocoHeader}>
                  <div className={styles.blocoTitle}>{label}</div>
                  <div className={styles.blocoAcoes}>
                    <button
                      className={styles.btnCopy + (copiado === key ? ' ' + styles.btnCopiado : '')}
                      onClick={() => copiar(texto, key)}
                    >
                      {copiado === key ? 'Copiado' : 'Copiar'}
                    </button>
                    <button className={styles.btnWhatsApp} onClick={() => enviarWhatsApp(texto)}>
                      WhatsApp
                    </button>
                  </div>
                </div>
                <div className={styles.blocoContent}>{texto}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
