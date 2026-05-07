'use client'

import { useState, useEffect } from 'react'
import NavInterno from '@/components/layout/NavInterno'

interface Acesso {
  timestamp: string
  ip: string
  userAgent: string
  referer: string
}

interface Evento {
  timestamp: string
  evento: string
  cenario?: number
  duracao_segundos?: number
}

interface Demo {
  slug: string
  cliente: string
  contato: string
  tipo: string
  ativo: boolean
  cenarios: any[]
  acessos: Acesso[]
  eventos: Evento[]
  total_acessos: number
  ultimo_acesso: string | null
  criado_em: string
}

export default function AdminDemos() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)
  const [demoSelecionada, setDemoSelecionada] = useState<Demo | null>(null)
  const [linkCopiado, setLinkCopiado] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/demos')
    const data = await res.json()
    setDemos(data.demos || [])
    setLoading(false)
  }

  async function toggleAtivo(slug: string, ativo: boolean) {
    await fetch('/api/demos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, ativo: !ativo }),
    })
    carregar()
  }

  async function deletar(slug: string) {
    if (!confirm('Deletar demo ' + slug + '? Não tem volta.')) return
    await fetch('/api/demos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    carregar()
    if (demoSelecionada?.slug === slug) setDemoSelecionada(null)
  }

  function copiarLink(slug: string) {
    const url = window.location.origin + '/demo/' + slug
    navigator.clipboard.writeText(url)
    setLinkCopiado(slug)
    setTimeout(() => setLinkCopiado(null), 2000)
  }

  function formatarData(iso: string | null) {
    if (!iso) return 'nunca'
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <>
      <NavInterno role="admin" paginaAtual="/admin/demos" />
      <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#0D1B2A' }}>Demos</h1>
          <div style={{ fontSize: 13, color: '#666' }}>{demos.length} demo(s)</div>
        </div>

        <div style={{ background: '#FFF8E7', border: '1px dashed #C8973A', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#5a4015' }}>
          Nova demo é criada via seed script (rodar uma vez com os dados do prospect). O painel mostra demos existentes, deixa ativar/desativar, copiar link e ver tracking.
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Carregando...</div>
        ) : demos.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666', background: '#fff', borderRadius: 8 }}>
            Nenhuma demo criada ainda.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#0D1B2A' }}>Lista</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {demos.map(d => (
                  <div
                    key={d.slug}
                    onClick={() => setDemoSelecionada(d)}
                    style={{
                      background: '#fff',
                      border: demoSelecionada?.slug === d.slug ? '2px solid #2E5EAA' : '1px solid #e0e0e0',
                      borderRadius: 8,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0D1B2A', fontSize: 15 }}>{d.cliente}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                          {d.contato ? <span>contato: <strong>{d.contato}</strong> · </span> : null}
                          tipo: {d.tipo}
                        </div>
                      </div>
                      <div style={{ background: d.ativo ? '#e6f4ea' : '#fce8e6', color: d.ativo ? '#1e7e34' : '#a52714', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4 }}>
                        {d.ativo ? 'ATIVA' : 'INATIVA'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666', marginBottom: 8 }}>
                      <span>📊 {d.total_acessos || 0} acessos</span>
                      <span>🕐 último: {formatarData(d.ultimo_acesso)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={(e) => { e.stopPropagation(); copiarLink(d.slug) }} style={btnStyle('#2E5EAA')}>
                        {linkCopiado === d.slug ? 'copiado!' : 'copiar link'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleAtivo(d.slug, d.ativo) }} style={btnStyle(d.ativo ? '#666' : '#2E8B57')}>
                        {d.ativo ? 'desativar' : 'ativar'}
                      </button>
                      <a
                        href={'/demo/' + d.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ ...btnStyle('#C8973A'), textDecoration: 'none', display: 'inline-block' }}
                      >
                        abrir
                      </a>
                      <button onClick={(e) => { e.stopPropagation(); deletar(d.slug) }} style={btnStyle('#CC2936')}>
                        deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#0D1B2A' }}>Detalhes</h2>
              {demoSelecionada ? (
                <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0D1B2A' }}>{demoSelecionada.cliente}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      slug: <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>{demoSelecionada.slug}</code>
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                      criada: {formatarData(demoSelecionada.criado_em)}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>Cenários ({demoSelecionada.cenarios?.length || 0})</div>
                    <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#444' }}>
                      {demoSelecionada.cenarios?.map((c: any, i: number) => (
                        <li key={i} style={{ marginBottom: 4 }}>{c.titulo}</li>
                      ))}
                    </ol>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>
                      Acessos ({demoSelecionada.acessos?.length || 0})
                    </div>
                    {demoSelecionada.acessos && demoSelecionada.acessos.length > 0 ? (
                      <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f9f9f9', borderRadius: 4, padding: 8 }}>
                        {demoSelecionada.acessos.slice(-20).reverse().map((a, i) => (
                          <div key={i} style={{ fontSize: 11, color: '#444', padding: '6px 8px', borderBottom: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600 }}>{formatarData(a.timestamp)}</div>
                            <div style={{ color: '#888', marginTop: 2 }}>IP: {a.ip} · {a.userAgent.substring(0, 60)}...</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Sem acessos ainda.</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>
                      Eventos ({demoSelecionada.eventos?.length || 0})
                    </div>
                    {demoSelecionada.eventos && demoSelecionada.eventos.length > 0 ? (
                      <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f9f9f9', borderRadius: 4, padding: 8 }}>
                        {demoSelecionada.eventos.slice(-30).reverse().map((e, i) => (
                          <div key={i} style={{ fontSize: 11, color: '#444', padding: '6px 8px', borderBottom: '1px solid #eee' }}>
                            <div>
                              <strong>{e.evento}</strong>
                              {e.cenario ? <span> · cenário {e.cenario}</span> : null}
                            </div>
                            <div style={{ color: '#888', marginTop: 2 }}>
                              {formatarData(e.timestamp)}
                              {e.duracao_segundos ? <span> · {e.duracao_segundos}s na página</span> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Sem eventos registrados.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 8, padding: 40, textAlign: 'center', color: '#888', border: '1px solid #e0e0e0' }}>
                  Clica numa demo pra ver detalhes.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function btnStyle(cor: string): React.CSSProperties {
  return {
    background: cor,
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  }
}
