'use client'
import { useState, useEffect } from 'react'
import NavInterno from '@/components/layout/NavInterno'
import styles from './admin.module.css'

interface Usuario {
  uid: string
  nome: string
  email: string
  role: string
  status: string
}

interface Reuniao {
  id: number | string
  uid?: string
  title: string
  startTime: string
  endTime: string
  status: string
  attendees: { name: string; email: string }[]
  description?: string
  manual?: boolean
}

interface NovaReuniao {
  nome: string
  email: string
  telefone: string
  data: string
  hora: string
  observacao: string
}

export default function Admin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReunioes, setLoadingReunioes] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'reunioes'>('usuarios')
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [nova, setNova] = useState<NovaReuniao>({ nome: '', email: '', telefone: '', data: '', hora: '', observacao: '' })

  useEffect(() => { carregarUsuarios(); carregarReunioes() }, [])

  async function carregarUsuarios() {
    const res = await fetch('/api/admin/usuarios')
    const data = await res.json()
    setUsuarios(data.usuarios || [])
    setLoading(false)
  }

  async function carregarReunioes() {
    const res = await fetch('/api/admin/reunioes')
    const data = await res.json()
    setReunioes(data.reunioes || [])
    setLoadingReunioes(false)
  }

  async function acao(uid: string, tipo: 'aprovar' | 'bloquear') {
    await fetch('/api/auth/aprovar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, acao: tipo }) })
    carregarUsuarios()
  }

  async function cancelarReuniao(bookingId: number | string, manual?: boolean) {
    if (!confirm('Cancelar esta reunião?')) return
    await fetch('/api/admin/reunioes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId, manual }) })
    carregarReunioes()
  }

  async function criarReuniao() {
    if (!nova.nome || !nova.data || !nova.hora) return alert('Preencha nome, data e hora.')
    setSalvando(true)
    await fetch('/api/admin/reunioes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nova) })
    setSalvando(false)
    setModalAberto(false)
    setNova({ nome: '', email: '', telefone: '', data: '', hora: '', observacao: '' })
    carregarReunioes()
  }

  function abrirReschedule(uid?: string) {
    if (!uid) return
    window.open(`https://cal.com/booking/${uid}?reschedule=true`, '_blank')
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatarHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const pendentes  = usuarios.filter(u => u.status === 'pendente')
  const aprovados  = usuarios.filter(u => u.status === 'aprovado')
  const bloqueados = usuarios.filter(u => u.status === 'bloqueado')
  const reunioesAtivas     = reunioes.filter(r => r.status === 'ACCEPTED' || r.status === 'PENDING')
  const reunioesCanceladas = reunioes.filter(r => r.status === 'CANCELLED')

  const inputStyle = { width:'100%', background:'var(--black)', border:'1px solid var(--border)', color:'var(--white)', fontFamily:'var(--font-mono)', fontSize:'12px', padding:'10px 12px', outline:'none', boxSizing:'border-box' as const }
  const labelStyle = { display:'block', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'var(--smoke)', textTransform:'uppercase' as const, marginBottom:'6px' }

  return (
    <div className={styles.page}>
      <NavInterno role="admin" paginaAtual="/admin" />
      <main className={styles.main}>
        <h1 className={styles.title}>Painel <em>Admin</em></h1>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{pendentes.length}</div>
            <div className={styles.statLabel}>Aguardando aprovação</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum} style={{color:'var(--green-br)'}}>{aprovados.length}</div>
            <div className={styles.statLabel}>Aprovados</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum} style={{color:'var(--gold)'}}>{reunioesAtivas.length}</div>
            <div className={styles.statLabel}>Reuniões agendadas</div>
          </div>
        </div>

        <div style={{display:'flex', gap:'1px', background:'var(--border)', marginBottom:'32px'}}>
          <button onClick={() => setAbaAtiva('usuarios')} style={{flex:1, padding:'12px', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', border:'none', background: abaAtiva === 'usuarios' ? 'var(--gold)' : 'var(--card)', color: abaAtiva === 'usuarios' ? 'var(--black)' : 'var(--smoke)', transition:'all 0.2s'}}>
            Usuários ({usuarios.length})
          </button>
          <button onClick={() => setAbaAtiva('reunioes')} style={{flex:1, padding:'12px', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', border:'none', background: abaAtiva === 'reunioes' ? 'var(--gold)' : 'var(--card)', color: abaAtiva === 'reunioes' ? 'var(--black)' : 'var(--smoke)', transition:'all 0.2s'}}>
            Reuniões ({reunioesAtivas.length})
          </button>
        </div>

        {abaAtiva === 'usuarios' && (
          <>
            {loading && <div className={styles.empty}>Carregando...</div>}
            {pendentes.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>// Aguardando aprovação</div>
                {pendentes.map(u => (
                  <div key={u.uid} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{u.nome}</div>
                      <div className={styles.userEmail}>{u.email}</div>
                    </div>
                    <div className={styles.userActions}>
                      <button className={styles.btnAprovar} onClick={() => acao(u.uid, 'aprovar')}>✓ Aprovar</button>
                      <button className={styles.btnBloquear} onClick={() => acao(u.uid, 'bloquear')}>✕ Bloquear</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>// Pontas de lança ativos</div>
              {aprovados.length === 0 ? <div className={styles.empty}>Nenhum usuário aprovado ainda.</div> : aprovados.map(u => (
                <div key={u.uid} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{u.nome}</div>
                    <div className={styles.userEmail}>{u.email}</div>
                  </div>
                  <div className={styles.userActions}>
                    <span className={styles.tagAtivo}>✓ Ativo</span>
                    <button className={styles.btnBloquear} onClick={() => acao(u.uid, 'bloquear')}>Bloquear</button>
                  </div>
                </div>
              ))}
            </div>
            {bloqueados.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>// Bloqueados</div>
                {bloqueados.map(u => (
                  <div key={u.uid} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{u.nome}</div>
                      <div className={styles.userEmail}>{u.email}</div>
                    </div>
                    <div className={styles.userActions}>
                      <button className={styles.btnAprovar} onClick={() => acao(u.uid, 'aprovar')}>Reativar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {abaAtiva === 'reunioes' && (
          <>
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'16px'}}>
              <button className={styles.btnAprovar} onClick={() => setModalAberto(true)}>+ Nova reunião</button>
            </div>

            {loadingReunioes && <div className={styles.empty}>Carregando reuniões...</div>}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>// Agendadas</div>
              {reunioesAtivas.length === 0 ? <div className={styles.empty}>Nenhuma reunião agendada.</div> : reunioesAtivas.map(r => (
                <div key={r.id} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {r.attendees[0]?.name || 'Lead'}
                      {r.manual && <span style={{fontFamily:'var(--font-mono)', fontSize:'8px', color:'var(--smoke)', marginLeft:'8px', letterSpacing:'0.1em'}}>MANUAL</span>}
                    </div>
                    <div className={styles.userEmail}>{r.attendees[0]?.email}</div>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--gold)', marginTop:'4px'}}>
                      {formatarData(r.startTime)} às {formatarHora(r.startTime)} — {formatarHora(r.endTime)}
                    </div>
                    {r.description && (
                      <div style={{fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--smoke)', marginTop:'4px', maxWidth:'400px'}}>
                        {r.description.slice(0, 120)}{r.description.length > 120 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  <div className={styles.userActions}>
                    {!r.manual && <button className={styles.btnAprovar} onClick={() => abrirReschedule(r.uid)}>↻ Reagendar</button>}
                    <button className={styles.btnBloquear} onClick={() => cancelarReuniao(r.id, r.manual)}>✕ Cancelar</button>
                  </div>
                </div>
              ))}
            </div>

            {reunioesCanceladas.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>// Canceladas</div>
                {reunioesCanceladas.map(r => (
                  <div key={r.id} className={styles.userCard} style={{opacity:0.5}}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{r.attendees[0]?.name || 'Lead'}</div>
                      <div className={styles.userEmail}>{r.attendees[0]?.email}</div>
                      <div style={{fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--smoke)', marginTop:'4px'}}>
                        {formatarData(r.startTime)} às {formatarHora(r.startTime)}
                      </div>
                    </div>
                    <div className={styles.userActions}>
                      <span style={{fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--smoke)', letterSpacing:'0.1em'}}>CANCELADA</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {modalAberto && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'24px'}}>
          <div style={{background:'var(--card)', border:'1px solid var(--border)', padding:'32px', width:'100%', maxWidth:'480px'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.15em', color:'var(--green-lt)', textTransform:'uppercase', marginBottom:'24px'}}>// Nova reunião manual</div>

            <div style={{display:'grid', gap:'16px'}}>
              <div>
                <label style={labelStyle}>Nome *</label>
                <input style={inputStyle} value={nova.nome} onChange={e => setNova({...nova, nome: e.target.value})} placeholder="Nome do lead" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={nova.email} onChange={e => setNova({...nova, email: e.target.value})} placeholder="email@exemplo.com" />
              </div>
              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>
                <input style={inputStyle} value={nova.telefone} onChange={e => setNova({...nova, telefone: e.target.value})} placeholder="+1 (365) 000-0000" />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <div>
                  <label style={labelStyle}>Data *</label>
                  <input style={inputStyle} type="date" value={nova.data} onChange={e => setNova({...nova, data: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Hora *</label>
                  <input style={inputStyle} type="time" value={nova.hora} onChange={e => setNova({...nova, hora: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Observação</label>
                <textarea style={{...inputStyle, height:'80px', resize:'vertical'}} value={nova.observacao} onChange={e => setNova({...nova, observacao: e.target.value})} placeholder="Contexto do lead, origem, etc." />
              </div>
            </div>

            <div style={{display:'flex', gap:'8px', marginTop:'24px', justifyContent:'flex-end'}}>
              <button className={styles.btnBloquear} onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className={styles.btnAprovar} onClick={criarReuniao} disabled={salvando}>
                {salvando ? 'Salvando...' : '✓ Criar reunião'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
