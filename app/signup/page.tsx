'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import styles from '../login/login.module.css'

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
const db = getFirestore(app)

export default function Signup() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha)
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        uid:       cred.user.uid,
        email,
        nome,
        role:      'pendente',
        status:    'pendente',
        criado_em: serverTimestamp(),
      })
      await fetch('/api/auth/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, uid: cred.user.uid }),
      })
      setSucesso(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('email-already-in-use')) setErro('Este email já está cadastrado.')
      else if (msg.includes('weak-password')) setErro('Senha muito fraca. Mínimo 6 caracteres.')
      else setErro('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>Alpha<span>Ops</span></div>
        <h1 className={styles.title}>Cadastro enviado</h1>
        <p style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--mist)',lineHeight:1.7,marginBottom:20}}>
          Seu cadastro foi recebido e está aguardando aprovação de André.
          Você receberá um e-mail quando sua conta for liberada.
        </p>
        <a href="/login" className={styles.link}>← Voltar para o login</a>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>Alpha<span>Ops</span></div>
        <h1 className={styles.title}>Solicitar acesso</h1>
        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label}>Nome completo</div>
            <input className={styles.input} type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Email</div>
            <input className={styles.input} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Senha</div>
            <input className={styles.input} type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          {erro && <div className={styles.erro}>{erro}</div>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Enviando...' : '→ Solicitar acesso'}
          </button>
        </form>
        <a href="/login" className={styles.link}>Já tem acesso? Fazer login</a>
      </div>
    </div>
  )
}