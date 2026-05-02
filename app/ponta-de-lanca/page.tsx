'use client'
import { useState, useEffect, useCallback } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import { saveToWikiFolder, slugify } from '@/lib/wiki-export'
import styles from './ponta.module.css'

interface EtapaData {
  etapa: number
  mensagem: string
  orientacao: string
  avancar: string
  manter: string
  contorno: string
  proximaEtapa: number | null
  respostaLead?: string
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
  criado_em: string
}

const NOMES_ETAPAS = ['', 'Abertura', 'Identificar Dor', 'Apresentar Solução', 'Propor Diagnóstico', 'Fechar Compromisso']

function formatarConversaParaMarkdown(conv: Conversa): string {
  const slugLead = slugify(conv.nome_lead || '')
  const data = conv.atualizado_em ? new Date(conv.atualizado_em) : new Date()
  const dataYmd = data.toISOString().slice(0, 10)
  const dataPtBr = data.toLocaleDateString('pt-BR')

  const linhas: string[] = [
    '---',
    'type: conversation',
    'canal: whatsapp',
    `contraparte: ${slugLead}`,
    `data: ${dataYmd}`,
    `nicho: ${conv.nicho || ''}`,
    `operador: ${conv.nome_usuario || ''}`,
    `etapa-final: ${conv.etapa_atual || 0}`,
    '---',
    '',
    `# Conversa com ${conv.nome_lead || 'Lead sem nome'} — ${conv.nicho || ''}`,
    '',
    `**WhatsApp:** ${conv.whatsapp || ''}`,
    `**Operador:** ${conv.nome_usuario || ''}`,
    `**Última atualização:** ${dataPtBr}`,
    '',
  ]

  for (const et of (conv.etapas || []).filter(Boolean)) {
    linhas.push(`## Etapa ${et.etapa} — ${NOMES_ETAPAS[et.etapa] || ''}`, '')
    if (et.respostaLead && et.respostaLead.trim()) {
      linhas.push('**Resposta do lead na etapa anterior:**', et.respostaLead.trim(), '')
    }
    linhas.push('**Mensagem enviada:**', et.mensagem || '', '')
    linhas.push('**Análise interna:**', et.orientacao || '', '')
  }

  return linhas.join('\n')
}

export default function PontaDeLanca() {
  const [aba, setAba]                     = useState<'abordagem' | 'roteiro' | 'historico'>('abordagem')
  const [nicho, setNicho]                 = useState('')
  const [nomeLead, setNomeLead]           = useState('')
  const [whatsapp, setWhatsapp]           = useState('')
  const [loading, setLoading]             = useState(false)
  const [copiado, setCopiado]             = useState<string | null>(null)
  const [resultado, setResultado]         = useState<{abordagem:string,cartao:string} | null>(null)
  const [role, setRole]                   = useState<'admin' | 'ponta_de_lanca'>('ponta_de_lanca')
  const [nomeUsuario, setNomeUsuario]     = useState('')
  const [etapaAtual, setEtapaAtual]       = useState(0)
  const [etapas, setEtapas]               = useState<EtapaData[]>([])
  const [respostaLead, setRespostaLead]   = useState('')
  const [loadingEtapa, setLoadingEtapa]   = useState(false)
  const [mostrarContorno, setMostrarContorno] = useState<number | null>(null)
  const [conversas, setConversas]         = useState<Conversa[]>([])
  const [loadingConversas, setLoadingConversas] = useState(false)
  const [conversaId, setConversaId]       = useState<string | null>(null)
  const [salvando, setSalvando]           = useState(false)
  const [salvandoWiki, setSalvandoWiki]   = useState<string | null>(null)
  const [wikiStatus, setWikiStatus]       = useState<{ id: string; mode: 'fs' | 'download' } | null>(null)

  useEffect(() => {
    const match = document.cookie.match(/alphaops-role-pub=([^;]+)/)
    const val = match ? match[1].trim() : ''
    if (val === 'admin') setRole('admin')
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.nome) setNomeUsuario(d.nome) })
      .catch(() => {})
  }, [])

  const carregarConversas = useCallback(async () => {
    setLoadingConversas(true)
    try {
      const res = await fetch('/api/conversas')
      const data = await res.json()
      setConversas(data.conversas || [])
    } catch {}
    setLoadingConversas(false)
  }, [])

  useEffect(() => {
    if (aba === 'historico') carregarConversas()
  }, [aba, carregarConversas])

  async function salvarConversa() {
    setSalvando(true)
    try {
      const res = await fetch('/api/conversas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: conversaId, nicho, nomeLead, whatsapp, nomeUsuario, etapas, etapaAtual }),
      })
      const data = await res.json()
      if (data.id) setConversaId(data.id)
    } catch {}
    setSalvando(false)
  }

  function carregarConversa(conv: Conversa) {
    setNicho(conv.nicho)
    setNomeLead(conv.nome_lead)
    setWhatsapp(conv.whatsapp)
    setEtapas(conv.etapas || [])
    setEtapaAtual(conv.etapa_atual || 0)
    setConversaId(conv.id)
    setResultado(null)
    setRespostaLead('')
    setAba('roteiro')
  }

  async function deletarConversa(id: string) {
    if (!confirm('Deletar esta conversa?')) return
    await fetch('/api/conversas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregarConversas()
  }

  async function salvarNoWiki(conv: Conversa) {
    const slug = slugify(conv.nome_lead || '')
    const data = conv.atualizado_em ? new Date(conv.atualizado_em) : new Date()
    const filename = `${data.toISOString().slice(0, 10)}-${slug}.md`
    const content = formatarConversaParaMarkdown(conv)
    setSalvandoWiki(conv.id)
    try {
      const result = await saveToWikiFolder('conversas', filename, content)
      setWikiStatus({ id: conv.id, mode: result.mode })
      const ttl = result.mode === 'fs' ? 2000 : 5000
      setTimeout(() => setWikiStatus(prev => prev?.id === conv.id ? null : prev), ttl)
    } finally {
      setSalvandoWiki(null)
    }
  }

  function novaConversa() {
    setNicho(''); setNomeLead(''); setWhatsapp('')
    setEtapas([]); setEtapaAtual(0); setConversaId(null)
    setResultado(null); setRespostaLead('')
    setAba('abordagem')
  }

  async function gerarAbordagem() {
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
    } catch { alert('Erro ao gerar.') }
    setLoading(false)
  }

  async function gerarEtapa(etapa: number, resposta?: string) {
    if (!nicho.trim()) { alert('Preencha o nicho primeiro.'); return }
    setLoadingEtapa(true)
    try {
      const res = await fetch('/api/roteiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa, nicho, nomeLead, nomeUsuario, respostaLead: resposta || '' }),
      })
      const data = await res.json()
      const novasEtapas = [...etapas]
      const idxAnterior = etapa - 2
      if (idxAnterior >= 0 && novasEtapas[idxAnterior] && resposta && resposta.trim()) {
        novasEtapas[idxAnterior] = { ...novasEtapas[idxAnterior], respostaLead: resposta.trim() }
      }
      novasEtapas[etapa - 1] = data
      setEtapas(novasEtapas)
      setEtapaAtual(etapa)
      setRespostaLead('')
      // Auto-salvar
      setTimeout(async () => {
        const res2 = await fetch('/api/conversas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: conversaId, nicho, nomeLead, whatsapp, nomeUsuario, etapas: novasEtapas, etapaAtual: etapa }),
        })
        const d2 = await res2.json()
        if (d2.id && !conversaId) setConversaId(d2.id)
      }, 100)
    } catch { alert('Erro ao gerar etapa.') }
    setLoadingEtapa(false)
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

  const temDados = nicho.trim()

  return (
    <div className={styles.page}>
      <NavInterno role={role} paginaAtual="/ponta-de-lanca" />
      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>Gerador de<br /><em>Abordagem</em></h1>
          <div className={styles.topAcoes}>
            {conversaId && <span className={styles.conversaTag}>Conversa salva</span>}
            <button className={styles.btnNova} onClick={novaConversa}>+ Nova conversa</button>
          </div>
        </div>

        {/* Campos comuns */}
        <div className={styles.camposGrid}>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>Nicho *</div>
            <input className={styles.input} type="text"
              placeholder="Ex: clinica odontologica..."
              value={nicho} onChange={e => setNicho(e.target.value)} />
          </div>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>Nome do lead</div>
            <input className={styles.input} type="text"
              placeholder="Ex: Maria, João..."
              value={nomeLead} onChange={e => setNomeLead(e.target.value)} />
          </div>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>WhatsApp (com DDI)</div>
            <input className={styles.input} type="text"
              placeholder="Ex: 5561999999999"
              value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
        </div>

        {nomeUsuario && (
          <div className={styles.usuarioInfo}>
            Gerando como: <strong>{nomeUsuario}</strong>
            {conversaId && <span className={styles.salvandoTag}>{salvando ? ' · Salvando...' : ' · Salvo'}</span>}
          </div>
        )}

        {/* Abas */}
        <div className={styles.abas}>
          <button className={styles.aba + (aba === 'abordagem' ? ' ' + styles.abaAtiva : '')} onClick={() => setAba('abordagem')}>
            Abordagem inicial
          </button>
          <button className={styles.aba + (aba === 'roteiro' ? ' ' + styles.abaAtiva : '')} onClick={() => setAba('roteiro')}>
            Roteiro de conversa
          </button>
          <button className={styles.aba + (aba === 'historico' ? ' ' + styles.abaAtiva : '')} onClick={() => setAba('historico')}>
            Conversas salvas
          </button>
        </div>

        {/* ABA: Abordagem */}
        {aba === 'abordagem' && (
          <div>
            <button className={styles.btnGerar} onClick={gerarAbordagem} disabled={loading || !temDados}>
              {loading ? 'Gerando...' : 'Gerar abordagem'}
            </button>
            {loading && <div className={styles.loading}><div className={styles.spinner} /><span>Gerando...</span></div>}
            {resultado && (
              <div className={styles.resultados}>
                {[
                  { key: 'abordagem', label: '// Mensagem de abordagem', texto: resultado.abordagem },
                  { key: 'cartao',    label: '// Cartão de visita digital', texto: resultado.cartao },
                ].map(({ key, label, texto }) => (
                  <div key={key} className={styles.bloco}>
                    <div className={styles.blocoHeader}>
                      <div className={styles.blocoTitle}>{label}</div>
                      <div className={styles.blocoAcoes}>
                        <button className={styles.btnCopy + (copiado === key ? ' ' + styles.btnCopiado : '')} onClick={() => copiar(texto, key)}>
                          {copiado === key ? 'Copiado' : 'Copiar'}
                        </button>
                        <button className={styles.btnWhatsApp} onClick={() => enviarWhatsApp(texto)}>WhatsApp</button>
                      </div>
                    </div>
                    <div className={styles.blocoContent}>{texto}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: Roteiro */}
        {aba === 'roteiro' && (
          <div className={styles.roteiro}>
            {etapaAtual === 0 && (
              <button className={styles.btnGerar} onClick={() => gerarEtapa(1)} disabled={loadingEtapa || !temDados}>
                {loadingEtapa ? 'Gerando...' : 'Iniciar conversa — Gerar abertura'}
              </button>
            )}
            {loadingEtapa && <div className={styles.loading}><div className={styles.spinner} /><span>Gerando...</span></div>}

            {etapas.map((etapa, idx) => etapa && (
              <div key={idx} className={styles.etapaBloco}>
                <div className={styles.etapaHeader}>
                  <span className={styles.etapaBadge}>Etapa {etapa.etapa}</span>
                  <span className={styles.etapaNome}>{NOMES_ETAPAS[etapa.etapa]}</span>
                </div>
                <div className={styles.bloco}>
                  <div className={styles.blocoHeader}>
                    <div className={styles.blocoTitle}>// Mensagem para o lead</div>
                    <div className={styles.blocoAcoes}>
                      <button className={styles.btnCopy + (copiado === 'msg'+idx ? ' ' + styles.btnCopiado : '')} onClick={() => copiar(etapa.mensagem, 'msg'+idx)}>
                        {copiado === 'msg'+idx ? 'Copiado' : 'Copiar'}
                      </button>
                      <button className={styles.btnWhatsApp} onClick={() => enviarWhatsApp(etapa.mensagem)}>WhatsApp</button>
                    </div>
                  </div>
                  <div className={styles.blocoContent}>{etapa.mensagem}</div>
                </div>
                <div className={styles.orientacao}>
                  <div className={styles.orientacaoTitle}>// Para você — não é enviado</div>
                  <div className={styles.orientacaoTexto}>{etapa.orientacao}</div>
                  <div className={styles.orientacaoAcoes}>
                    <div className={styles.orientacaoItem}>
                      <span className={styles.tagAvancar}>→ Avançar</span>
                      <span>{etapa.avancar}</span>
                    </div>
                    <div className={styles.orientacaoItem}>
                      <span className={styles.tagManter}>⟳ Manter</span>
                      <span>{etapa.manter}</span>
                    </div>
                  </div>
                  <button className={styles.btnContorno} onClick={() => setMostrarContorno(mostrarContorno === idx ? null : idx)}>
                    {mostrarContorno === idx ? 'Ocultar' : 'Ver'} argumento de contorno
                  </button>
                  {mostrarContorno === idx && (
                    <div className={styles.contornoBox}>
                      <div className={styles.blocoHeader}>
                        <div className={styles.blocoTitle}>// Argumento de contorno</div>
                        <div className={styles.blocoAcoes}>
                          <button className={styles.btnCopy + (copiado === 'cont'+idx ? ' ' + styles.btnCopiado : '')} onClick={() => copiar(etapa.contorno, 'cont'+idx)}>
                            {copiado === 'cont'+idx ? 'Copiado' : 'Copiar'}
                          </button>
                          <button className={styles.btnWhatsApp} onClick={() => enviarWhatsApp(etapa.contorno)}>WhatsApp</button>
                        </div>
                      </div>
                      <div className={styles.blocoContent}>{etapa.contorno}</div>
                    </div>
                  )}
                </div>
                {etapa.proximaEtapa && idx === etapas.filter(Boolean).length - 1 && (
                  <div className={styles.respostaArea}>
                    <div className={styles.campoLabel}>Cole aqui a resposta do lead</div>
                    <textarea className={styles.textarea} rows={3}
                      placeholder="O que o lead respondeu..."
                      value={respostaLead} onChange={e => setRespostaLead(e.target.value)} />
                    <button className={styles.btnProxima}
                      onClick={() => gerarEtapa(etapa.proximaEtapa!, respostaLead)}
                      disabled={loadingEtapa || !respostaLead.trim()}>
                      {loadingEtapa ? 'Gerando...' : `Gerar Etapa ${etapa.proximaEtapa} — ${NOMES_ETAPAS[etapa.proximaEtapa]}`}
                    </button>
                  </div>
                )}
                {!etapa.proximaEtapa && idx === etapas.filter(Boolean).length - 1 && (
                  <div className={styles.conversaConcluida}>Conversa concluída — lead deve estar agendado.</div>
                )}
              </div>
            ))}

            <div className={styles.roteiroAcoes}>
              {etapaAtual > 0 && (
                <button className={styles.btnSalvar} onClick={salvarConversa} disabled={salvando}>
                  {salvando ? 'Salvando...' : conversaId ? 'Atualizar conversa' : 'Salvar conversa'}
                </button>
              )}
              {etapaAtual > 0 && (
                <button className={styles.btnReset} onClick={() => { setEtapas([]); setEtapaAtual(0); setRespostaLead(''); setConversaId(null) }}>
                  Reiniciar
                </button>
              )}
            </div>
          </div>
        )}

        {/* ABA: Histórico */}
        {aba === 'historico' && (
          <div className={styles.historico}>
            {loadingConversas && <div className={styles.loading}><div className={styles.spinner} /><span>Carregando...</span></div>}
            {!loadingConversas && conversas.length === 0 && (
              <div className={styles.vazio}>Nenhuma conversa salva ainda.</div>
            )}
            {conversas.map(conv => (
              <div key={conv.id}>
                <div className={styles.conversaCard}>
                  <div className={styles.conversaInfo} onClick={() => carregarConversa(conv)}>
                    <div className={styles.conversaNome}>{conv.nome_lead || 'Lead sem nome'}</div>
                    <div className={styles.conversaNicho}>{conv.nicho}</div>
                    <div className={styles.conversaMeta}>
                      {role === 'admin' && <span className={styles.conversaUsuario}>{conv.nome_usuario}</span>}
                      <span className={styles.conversaEtapa}>Etapa {conv.etapa_atual} — {NOMES_ETAPAS[conv.etapa_atual] || 'Não iniciado'}</span>
                      <span className={styles.conversaData}>{new Date(conv.atualizado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <button
                    className={styles.btnWiki + (wikiStatus?.id === conv.id ? ' ' + styles.btnWikiSalvo : '')}
                    onClick={(e) => { e.stopPropagation(); salvarNoWiki(conv) }}
                    disabled={salvandoWiki === conv.id}
                  >
                    {salvandoWiki === conv.id ? 'Salvando...'
                      : wikiStatus?.id === conv.id ? (wikiStatus.mode === 'fs' ? '✓ Salvo' : '↓ Baixado')
                      : 'Salvar no wiki'}
                  </button>
                  <button className={styles.btnDeletar} onClick={() => deletarConversa(conv.id)}>✕</button>
                </div>
                {wikiStatus?.id === conv.id && wikiStatus.mode === 'download' && (
                  <div className={styles.wikiAviso}>Salvo em ~/Downloads. Mova para ~/alphaops-wiki/raw/conversas/</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
