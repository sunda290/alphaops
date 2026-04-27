'use client'
import { useState, useEffect } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import styles from './ponta.module.css'

interface EtapaData {
  etapa: number
  mensagem: string
  orientacao: string
  avancar: string
  manter: string
  contorno: string
  proximaEtapa: number | null
}

const NOMES_ETAPAS = ['', 'Abertura', 'Identificar Dor', 'Apresentar Solução', 'Propor Diagnóstico', 'Fechar Compromisso']

export default function PontaDeLanca() {
  const [aba, setAba]                 = useState<'abordagem' | 'roteiro'>('abordagem')
  const [nicho, setNicho]             = useState('')
  const [nomeLead, setNomeLead]       = useState('')
  const [whatsapp, setWhatsapp]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [copiado, setCopiado]         = useState<string | null>(null)
  const [resultado, setResultado]     = useState<{abordagem:string,cartao:string} | null>(null)
  const [role, setRole]               = useState<'admin' | 'ponta_de_lanca'>('ponta_de_lanca')
  const [nomeUsuario, setNomeUsuario] = useState('')

  // Roteiro
  const [etapaAtual, setEtapaAtual]         = useState(0)
  const [etapas, setEtapas]                 = useState<EtapaData[]>([])
  const [respostaLead, setRespostaLead]     = useState('')
  const [loadingEtapa, setLoadingEtapa]     = useState(false)
  const [mostrarContorno, setMostrarContorno] = useState<number | null>(null)

  useEffect(() => {
    const match = document.cookie.match(/alphaops-role-pub=([^;]+)/)
    const val = match ? match[1].trim() : ''
    if (val === 'admin') setRole('admin')
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.nome) setNomeUsuario(d.nome) })
      .catch(() => {})
  }, [])

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
    } catch { alert('Erro ao gerar. Tente novamente.') }
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
      setEtapas(prev => {
        const novo = [...prev]
        novo[etapa - 1] = data
        return novo
      })
      setEtapaAtual(etapa)
      setRespostaLead('')
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

  const camposPreenchidos = nicho.trim()

  return (
    <div className={styles.page}>
      <NavInterno role={role} paginaAtual="/ponta-de-lanca" />
      <main className={styles.main}>
        <h1 className={styles.title}>Gerador de<br /><em>Abordagem</em></h1>

        {/* Campos comuns */}
        <div className={styles.camposGrid}>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>Nicho do estabelecimento *</div>
            <input className={styles.input} type="text"
              placeholder="Ex: clinica odontologica, restaurante..."
              value={nicho} onChange={e => setNicho(e.target.value)} />
          </div>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>Nome do lead</div>
            <input className={styles.input} type="text"
              placeholder="Ex: Maria, João..."
              value={nomeLead} onChange={e => setNomeLead(e.target.value)} />
          </div>
          <div className={styles.campoGrupo}>
            <div className={styles.campoLabel}>WhatsApp do lead (com DDI)</div>
            <input className={styles.input} type="text"
              placeholder="Ex: 5561999999999"
              value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
        </div>

        {nomeUsuario && (
          <div className={styles.usuarioInfo}>
            Gerando como: <strong>{nomeUsuario}</strong>
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
        </div>

        {/* ABA: Abordagem */}
        {aba === 'abordagem' && (
          <div>
            <button className={styles.btnGerar} onClick={gerarAbordagem} disabled={loading || !camposPreenchidos}>
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
              <button className={styles.btnGerar} onClick={() => gerarEtapa(1)} disabled={loadingEtapa || !camposPreenchidos}>
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

                {/* Mensagem limpa para enviar */}
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

                {/* Orientação para o ponta de lança */}
                <div className={styles.orientacao}>
                  <div className={styles.orientacaoTitle}>// Para você — não é enviado</div>
                  <div className={styles.orientacaoTexto}>{etapa.orientacao}</div>
                  <div className={styles.orientacaoAcoes}>
                    <div className={styles.orientacaoItem}>
                      <span className={styles.tagAvancar}>→ Avançar</span>
                      <span>{etapa.avancar}</span>
                    </div>
                    <div className={styles.orientacaoItem}>
                      <span className={styles.tagManter}>⟳ Manter etapa</span>
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
                        <button className={styles.btnCopy + (copiado === 'cont'+idx ? ' ' + styles.btnCopiado : '')} onClick={() => copiar(etapa.contorno, 'cont'+idx)}>
                          {copiado === 'cont'+idx ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <div className={styles.blocoContent}>{etapa.contorno}</div>
                    </div>
                  )}
                </div>

                {/* Campo resposta do lead para próxima etapa */}
                {etapa.proximaEtapa && idx === etapas.filter(Boolean).length - 1 && (
                  <div className={styles.respostaArea}>
                    <div className={styles.campoLabel}>Cole aqui a resposta do lead</div>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      placeholder="O que o lead respondeu..."
                      value={respostaLead}
                      onChange={e => setRespostaLead(e.target.value)}
                    />
                    <button
                      className={styles.btnProxima}
                      onClick={() => gerarEtapa(etapa.proximaEtapa!, respostaLead)}
                      disabled={loadingEtapa || !respostaLead.trim()}
                    >
                      {loadingEtapa ? 'Gerando...' : `Gerar Etapa ${etapa.proximaEtapa} — ${NOMES_ETAPAS[etapa.proximaEtapa]}`}
                    </button>
                  </div>
                )}

                {!etapa.proximaEtapa && idx === etapas.filter(Boolean).length - 1 && (
                  <div className={styles.conversaConcluida}>
                    Conversa concluída — lead deve estar agendado.
                  </div>
                )}
              </div>
            ))}

            {etapaAtual > 0 && (
              <button className={styles.btnReset} onClick={() => { setEtapas([]); setEtapaAtual(0); setRespostaLead('') }}>
                Reiniciar conversa
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
