'use client'
import { useState } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import styles from './ponta.module.css'

export default function PontaDeLanca() {
  const [nicho, setNicho] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{abordagem:string,cartao:string,roteiro:string} | null>(null)

  async function gerar() {
    if (!nicho.trim()) return
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch('/api/ponta-de-lanca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho }),
      })
      const data = await res.json()
      setResultado(data)
    } catch {
      alert('Erro ao gerar. Tente novamente.')
    }
    setLoading(false)
  }

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
  }

  return (
    <div className={styles.page}>
      <NavInterno role="ponta_de_lanca" paginaAtual="/ponta-de-lanca" />

      <main className={styles.main}>
        <h1 className={styles.title}>Gerador de<br /><em>Abordagem</em></h1>
        <p className={styles.sub}>Digite o nicho do estabelecimento e receba a abordagem completa.</p>

        <div className={styles.inputArea}>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex: restaurante italiano, clínica odontológica, auto escola..."
            value={nicho}
            onChange={e => setNicho(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && gerar()}
          />
          <button className={styles.btnGerar} onClick={gerar} disabled={loading || !nicho.trim()}>
            {loading ? 'Gerando...' : '→ Gerar'}
          </button>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Gerando abordagem para {nicho}...</span>
          </div>
        )}

        {resultado && (
          <div className={styles.resultados}>
            <div className={styles.bloco}>
              <div className={styles.blocoHeader}>
                <div className={styles.blocoTitle}>// Mensagem de abordagem</div>
                <button className={styles.btnCopy} onClick={() => copiar(resultado.abordagem)}>Copiar</button>
              </div>
              <div className={styles.blocoContent}>{resultado.abordagem}</div>
            </div>

            <div className={styles.bloco}>
              <div className={styles.blocoHeader}>
                <div className={styles.blocoTitle}>// Cartão de visita digital</div>
                <button className={styles.btnCopy} onClick={() => copiar(resultado.cartao)}>Copiar</button>
              </div>
              <div className={styles.blocoContent}>{resultado.cartao}</div>
            </div>

            <div className={styles.bloco}>
              <div className={styles.blocoHeader}>
                <div className={styles.blocoTitle}>// Roteiro de conversa</div>
                <button className={styles.btnCopy} onClick={() => copiar(resultado.roteiro)}>Copiar</button>
              </div>
              <div className={styles.blocoContent}>{resultado.roteiro}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}