'use client'
import { useState, useEffect } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import { saveToWikiFolder, slugify } from '@/lib/wiki-export'
import styles from './assistente.module.css'

const OBJETIVOS = [
  { id: 'qualificar', label: 'Qualificar' },
  { id: 'proposta', label: 'Proposta de valor' },
  { id: 'fechar', label: 'Fechar' },
  { id: 'objecao', label: 'Objeção' },
  { id: 'diagnostico', label: 'Diagnóstico completo' },
]

interface EtapaData {
  etapa: number
  mensagem: string
  orientacao: string
}

interface Conversa {
  id: string
  nicho: string
  nome_lead: string
  whatsapp: string
  nome_usuario: string
  etapa_atual: number
  etapas: EtapaData[]
  atualizado_em: string
}

function formatarDiagnosticoParaMarkdown(nome: string, segmento: string, resposta: string): string {
  const slugCliente = slugify(nome || '')
  const data = new Date()
  const dataYmd = data.toISOString().slice(0, 10)
  const dataPtBr = data.toLocaleDateString('pt-BR')

  return [
    '---',
    'type: proposal',
    `cliente: ${slugCliente}`,
    `data: ${dataYmd}`,
    'status: rascunho',
    `segmento: ${segmento || ''}`,
    '---',
    '',
    `# Diagnóstico — ${nome || 'Lead sem nome'}`,
    '',
    `**Segmento:** ${segmento || ''}`,
    `**Gerado em:** ${dataPtBr}`,
    '',
    '---',
    '',
    resposta || '',
  ].join('\n')
}

export default function Assistente() {
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const [segmento, setSegmento] = useState('')
  const [contexto, setContexto] = useState('')
  const [objetivo, setObjetivo] = useState('qualificar')
  const [resposta, setResposta] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [salvandoWiki, setSalvandoWiki] = useState(false)
  const [wikiStatus, setWikiStatus] = useState<'fs' | 'download' | null>(null)
  const [historico, setHistorico] = useState<{nome:string,preview:string,resposta:string,time:string}[]>([])
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [conversaSelecionada, setConversaSelecionada] = useState<string>('')
  const [loadingConversas, setLoadingConversas] = useState(false)

  useEffect(() => {
    carregarConversas()
  }, [])

  async function carregarConversas() {
    setLoadingConversas(true)
    try {
      const res = await fetch('/api/conversas')
      const data = await res.json()
      setConversas(data.conversas || [])
    } catch {}
    setLoadingConversas(false)
  }

  function selecionarConversa(id: string) {
    setConversaSelecionada(id)
    if (!id) return

    const c = conversas.find(c => c.id === id)
    if (!c) return

    setNome(c.nome_lead || '')
    setSegmento(c.nicho || '')

    const resumo = (c.etapas || []).map((e, i) => {
      const nomes = ['', 'Abertura', 'Identificar Dor', 'Apresentar Solução', 'Propor Diagnóstico', 'Fechar Compromisso']
      return `[Etapa ${e.etapa} - ${nomes[e.etapa] || ''}]\nAbordagem usada: ${e.mensagem || ''}`
    }).join('\n\n')

    setContexto(resumo || 'Nenhuma etapa registrada ainda.')
    setMensagem('')
    setResposta('')
  }

  async function gerar() {
    if (!mensagem.trim() && objetivo !== 'diagnostico') return
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
        preview: (mensagem || 'Diagnóstico completo').slice(0, 60) + '...',
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

  async function salvarNoWiki() {
    const slug = slugify(nome || '')
    const data = new Date()
    const filename = `${data.toISOString().slice(0, 10)}-${slug}-diagnostico.md`
    const content = formatarDiagnosticoParaMarkdown(nome, segmento, resposta)
    setSalvandoWiki(true)
    try {
      const result = await saveToWikiFolder('propostas', filename, content)
      setWikiStatus(result.mode)
      setTimeout(() => setWikiStatus(null), result.mode === 'fs' ? 2000 : 5000)
    } finally {
      setSalvandoWiki(false)
    }
  }

  const conversaSel = conversas.find(c => c.id === conversaSelecionada)

  return (
    <div className={styles.page}>
      <NavInterno role="admin" paginaAtual="/assistente" />

      <main className={styles.main}>
        <h1 className={styles.title}>Assistente de<br /><em>Diagnóstico</em></h1>
        <p className={styles.sub}>Selecione um lead ou cole a mensagem manualmente.</p>

        {/* Seletor de conversa */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>// Carregar conversa salva</div>
          <select
            className={styles.input}
            value={conversaSelecionada}
            onChange={e => selecionarConversa(e.target.value)}
            style={{width:'100%', marginBottom: conversaSelecionada ? 12 : 0}}
          >
            <option value="">
              {loadingConversas ? 'Carregando conversas...' : `Selecionar lead (${conversas.length} conversas)`}
            </option>
            {conversas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome_lead || 'Sem nome'} — {c.nicho || 'Sem nicho'} — Etapa {c.etapa_atual}/5
              </option>
            ))}
          </select>

          {conversaSel && (
            <div style={{
              background:'var(--black)', border:'1px solid var(--border)',
              padding:'12px 16px', fontFamily:'var(--font-mono)', fontSize:10,
              letterSpacing:'0.08em', color:'var(--smoke)', lineHeight:1.8
            }}>
              <span style={{color:'var(--green-br)'}}>✓ </span>
              <strong style={{color:'var(--white)'}}>{conversaSel.nome_lead}</strong>
              {' · '}{conversaSel.nicho}
              {' · '}Etapa {conversaSel.etapa_atual} de 5
              {' · '}Ponta: {conversaSel.nome_usuario}
              {' · '}
              <span style={{color:'var(--smoke)'}}>
                {new Date(conversaSel.atualizado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {/* Mensagem do lead */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>// Mensagem do lead</div>
          <textarea
            className={styles.textarea}
            rows={6}
            placeholder={objetivo === 'diagnostico'
              ? 'Opcional — o assistente usará o histórico da conversa para gerar o diagnóstico completo.'
              : 'Cole aqui a mensagem, transcrição do áudio ou o que o lead disse...'}
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
          />
        </div>

        {/* Contexto */}
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
            <div className={styles.fieldLabel}>Histórico da conversa</div>
            <textarea
              className={styles.textarea}
              rows={5}
              placeholder="Resumo do histórico da conversa..."
              value={contexto}
              onChange={e => setContexto(e.target.value)}
            />
          </div>
        </div>

        {/* Objetivo */}
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
          {objetivo === 'diagnostico' && (
            <div style={{marginTop:12, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--smoke)', letterSpacing:'0.08em', lineHeight:1.7}}>
              O assistente vai analisar todo o histórico e gerar: dores identificadas, oportunidade de automação, proposta de valor e próximo passo sugerido.
            </div>
          )}
        </div>

        <button
          className={styles.btnGenerate}
          onClick={gerar}
          disabled={loading || (!mensagem.trim() && objetivo !== 'diagnostico')}
        >
          {loading ? 'Gerando...' : objetivo === 'diagnostico' ? '→ Gerar diagnóstico completo' : '→ Gerar resposta'}
        </button>

        {(loading || resposta) && (
          <div className={styles.outputSection}>
            <div className={styles.outputHeader}>
              <div className={styles.outputTitle}>
                {objetivo === 'diagnostico' ? 'Diagnóstico gerado' : 'Resposta gerada'}
              </div>
              {resposta && (
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  {objetivo === 'diagnostico' && (
                    <button
                      className={`${styles.btnWiki} ${wikiStatus ? styles.btnWikiSalvo : ''}`}
                      onClick={salvarNoWiki}
                      disabled={salvandoWiki}
                    >
                      {salvandoWiki ? 'Salvando...'
                        : wikiStatus === 'fs' ? '✓ Salvo'
                        : wikiStatus === 'download' ? '↓ Baixado'
                        : 'Salvar no wiki'}
                    </button>
                  )}
                  <button className={`${styles.btnCopy} ${copied ? styles.btnCopied : ''}`} onClick={copiar}>
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
            </div>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Analisando e gerando{objetivo === 'diagnostico' ? ' diagnóstico' : ' resposta'}...</span>
              </div>
            ) : (
              <div className={styles.outputBox}>{resposta}</div>
            )}
            {wikiStatus === 'download' && (
              <div className={styles.wikiAviso}>Salvo em ~/Downloads. Mova para ~/alphaops-wiki/raw/propostas/</div>
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
