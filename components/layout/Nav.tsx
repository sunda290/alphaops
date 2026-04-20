'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav({ variant = 'default' }: { variant?: string }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '20px 40px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    background: scrolled ? 'rgba(0,0,0,0.92)' : 'transparent',
    borderBottom: scrolled ? '1px solid #222220' : '1px solid transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    transition: 'all 0.3s',
  }
  return (
    <nav style={navStyle}>
      <Link href="/" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ede9e0' }}>
        André<span style={{ color: '#c9a84c' }}>.</span>Oliveira
      </Link>
      <Link href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', background: '#c9a84c', padding: '10px 22px' }}>
        Diagnóstico Gratuito
      </Link>
    </nav>
  )
}
