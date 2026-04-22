'use client'
import { useState } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import styles from './assistente.module.css'

const OBJETIVOS = [
  { id: 'qualificar', label: 'Qualificar' },
  { id: 'proposta', label: 'Proposta de valor' },
  { id: 'fechar', label: 'Fechar' },
  { id: 'objecao', label: 'Objeção' },
]

export default function Assistente() {
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const [segmento, setSegmento] = useState('')
  const [contexto, setContexto] = useState('')
  const [objetivo, setObjetivo] = useState('qualificar')
  const [resposta, setResposta] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [historico, setHistorico] = useState<{nome:string,preview:string,resposta:string,time:string}[]>([])

  async function gerar() {
    if (!mensagem.trim()) return
    setLoading(true)
    setResposta('')
    try {
      const res = await fetch('/api/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem, nome, segmento, contexto, objetivo }),
      })
      const data = await res.json()
      const texto = data.resposta || data.error || 'Erro ao gerar resposta.'
      setResposta(texto)
      setHistorico(h => [{
        nome: nome || 'Lead',
        preview: mensagem.slice(0, 60) + '...',
        resposta: texto,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }, ...h])
    } catch {
      setResposta('Erro de conexão. Tente novamente.')
    }
    setLoading(false)
  }

  function copiar() {
    navigator.clipboard.writeText(resposta)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      <NavInterno role="admin" paginaAtual="/assistente" />

      <main className={styles.main}>
        <h1 className={styles.title}>Assistente de<br /><em>Diagnóstico</em></h1>
        <p className={styles.sub}>Cole a mensagem do lead e receba a resposta certa para mandar.</p>

        <div className={styles.card}>
          <div className={styles.cardLabel}>// Mensagem do lead</div>
          <textarea
            className={styles.textarea}
            rows={6}
            placeholder="Cole aqui a mensagem, transcrição do áudio ou o que o lead disse..."
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
          />
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>// Contexto</div>
          <div className={styles.grid}>
            <div>
              <div className={styles.fieldLabel}>Nome do lead</div>
              <input className={styles.input} type="text" placeholder="Ex: Ana" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div>
              <div className={styles.fieldLabel}>Segmento / Negócio</div>
              <input className={styles.input} type="text" placeholder="Ex: Auto detailing, Delivery..." value={segmento} onChange={e => setSegmento(e.target.value)} />
            </div>
          </div>
          <div style={{marginTop:12}}>
            <div className={styles.fieldLabel}>O que já foi conversado</div>
            <textarea className={styles.textarea} rows={3} placeholder="Resumo do histórico da conversa..." value={contexto} onChange={e => setContexto(e.target.value)} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>// Objetivo desta resposta</div>
          <div className={styles.tabs}>
            {OBJETIVOS.map(o => (
              <button
                key={o.id}
                className={`${styles.tab} ${objetivo === o.id ? styles.tabActive : ''}`}
                onClick={() => setObjetivo(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <button className={styles.btnGenerate} onClick={gerar} disabled={loading || !mensagem.trim()}>
          {loading ? 'Gerando...' : '→ Gerar resposta'}
        </button>

        {(loading || resposta) && (
          <div className={styles.outputSection}>
            <div className={styles.outputHeader}>
              <div className={styles.outputTitle}>Resposta gerada</div>
              {resposta && (
                <button className={`${styles.btnCopy} ${copied ? styles.btnCopied : ''}`} onClick={copiar}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              )}
            </div>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Analisando e gerando resposta...</span>
              </div>
            ) : (
              <div className={styles.outputBox}>{resposta}</div>
            )}
          </div>
        )}

        {historico.length > 0 && (
          <div className={styles.card} style={{marginTop:32}}>
            <div className={styles.cardLabel}>// Histórico da sessão</div>
            {historico.map((h, i) => (
              <div key={i} className={styles.histItem} onClick={() => setResposta(h.resposta)}>
                <div className={styles.histName}>{h.nome} <span className={styles.histTime}>{h.time}</span></div>
                <div className={styles.histPreview}>{h.preview}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}