'use client'
import { useState, useEffect } from 'react'
import styles from './admin.module.css'

interface Usuario {
  uid: string
  nome: string
  email: string
  role: string
  status: string
}

export default function Admin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarUsuarios() }, [])

  async function carregarUsuarios() {
    const res = await fetch('/api/admin/usuarios')
    const data = await res.json()
    setUsuarios(data.usuarios || [])
    setLoading(false)
  }

  async function acao(uid: string, tipo: 'aprovar' | 'bloquear') {
    await fetch('/api/auth/aprovar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, acao: tipo }),
    })
    carregarUsuarios()
  }

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const pendentes  = usuarios.filter(u => u.status === 'pendente')
  const aprovados  = usuarios.filter(u => u.status === 'aprovado')
  const bloqueados = usuarios.filter(u => u.status === 'bloqueado')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Alpha<span>Ops</span> <span className={styles.badge}>Admin</span></div>
        <div className={styles.headerNav}>
          <a href="/assistente" className={styles.navLink}>Assistente</a>
          <button className={styles.btnLogout} onClick={sair}>Sair</button>
        </div>
      </header>

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
            <div className={styles.statNum} style={{color:'var(--red)'}}>{bloqueados.length}</div>
            <div className={styles.statLabel}>Bloqueados</div>
          </div>
        </div>

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
          {aprovados.length === 0 ? (
            <div className={styles.empty}>Nenhum usuário aprovado ainda.</div>
          ) : aprovados.map(u => (
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
      </main>
    </div>
  )
}