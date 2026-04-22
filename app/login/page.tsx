'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase/app'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha)
      const idToken = await cred.user.getIdToken()
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'pendente') setErro('Sua conta está aguardando aprovação.')
        else if (data.error === 'bloqueado') setErro('Conta bloqueada. Entre em contato com André.')
        else setErro('Erro ao fazer login.')
        return
      }
      if (data.role === 'admin') router.push('/admin')
      else router.push('/ponta-de-lanca')
    } catch {
      setErro('Email ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>Alpha<span>Ops</span></div>
        <h1 className={styles.title}>Acesso ao sistema</h1>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label}>Email</div>
            <input className={styles.input} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Senha</div>
            <input className={styles.input} type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : '→ Entrar'}
          </button>
        </form>
        <a href="/signup" className={styles.link}>Não tem acesso? Solicitar cadastro</a>
      </div>
    </div>
  )
}