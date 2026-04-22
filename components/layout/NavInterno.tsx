'use client'
import { useState } from 'react'
import styles from './NavInterno.module.css'

interface NavInternoProps {
  role: 'admin' | 'ponta_de_lanca'
  paginaAtual: string
}

export default function NavInterno({ role, paginaAtual }: NavInternoProps) {
  const [menuAberto, setMenuAberto] = useState(false)

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const linksAdmin = [
    { href: '/admin', label: 'Painel' },
    { href: '/assistente', label: 'Assistente' },
    { href: '/ponta-de-lanca', label: 'Abordagem' },
  ]

  const linksPonta = [
    { href: '/ponta-de-lanca', label: 'Abordagem' },
  ]

  const links = role === 'admin' ? linksAdmin : linksPonta

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          Alpha<span>Ops</span>
          {role === 'admin' && <span className={styles.badge}>Admin</span>}
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => {
          const cls = styles.navLink + (paginaAtual === link.href ? ' ' + styles.navLinkAtivo : '')
          return <a key={link.href} href={link.href} className={cls}>{link.label}</a>
        })}
      </nav>

      <div className={styles.right}>
        <button className={styles.btnSair} onClick={sair}>Sair</button>
      </div>

      <button className={styles.hamburger} onClick={() => setMenuAberto(!menuAberto)} aria-label="Menu">
        <span className={styles.bar + (menuAberto ? ' ' + styles.barTop : '')} />
        <span className={styles.bar + (menuAberto ? ' ' + styles.barMid : '')} />
        <span className={styles.bar + (menuAberto ? ' ' + styles.barBot : '')} />
      </button>

      {menuAberto && (
        <div className={styles.mobileMenu}>
          {links.map((link) => {
            const cls = styles.mobileLink + (paginaAtual === link.href ? ' ' + styles.mobileLinkAtivo : '')
            return <a key={link.href} href={link.href} className={cls} onClick={() => setMenuAberto(false)}>{link.label}</a>
          })}
          <button className={styles.mobileSair} onClick={sair}>Sair</button>
        </div>
      )}
    </header>
  )
}
