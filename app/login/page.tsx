'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth'
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
  const [email, setEmail]               = useState('')
  const [senha, setSenha]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [erro, setErro]                 = useState('')
  const [modo, setModo]                 = useState('login')
  const [resetEnviado, setResetEnviado] = useState(false)
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

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setErro('Digite seu email para recuperar a senha.'); return }
    setLoading(true)
    setErro('')
    try {
      await sendPasswordResetEmail(auth, email)
      setResetEnviado(true)
    } catch {
      setErro('Email não encontrado. Verifique e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (resetEnviado) return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>Alpha<span>Ops</span></div>
        <h1 className={styles.title}>Email enviado</h1>
        <p style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--mist)',lineHeight:1.7,marginBottom:20}}>
          Enviamos um link de recuperação para {email}. Verifique sua caixa de entrada e spam.
        </p>
        <button className={styles.btn} onClick={() => { setModo('login'); setResetEnviado(false) }}>
          Voltar para o login
        </button>
      </div>
    </div>
  )

  if (modo === 'reset') return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>Alpha<span>Ops</span></div>
        <h1 className={styles.title}>Recuperar senha</h1>
        <form onSubmit={handleReset} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label}>Email da conta</div>
            <input
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
        <button
          onClick={() => { setModo('login'); setErro('') }}
          style={{background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.1em',color:'var(--smoke)',marginTop:20,width:'100%'}}
        >
          Voltar para o login
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>Alpha<span>Ops</span></div>
        <h1 className={styles.title}>Acesso ao sistema</h1>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label}>Email</div>
            <input
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Senha</div>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>
          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : '→ Entrar'}
          </button>
        </form>
        <button
          onClick={() => { setModo('reset'); setErro('') }}
          style={{background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.1em',color:'var(--smoke)',marginTop:16,width:'100%'}}
        >
          Esqueci minha senha
        </button>
        <a href="/signup" className={styles.link}>Não tem acesso? Solicitar cadastro</a>
      </div>
    </div>
  )
}
