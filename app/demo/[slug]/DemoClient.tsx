'use client'

import { useEffect, useRef, useState } from 'react'

interface Mensagem {
  type: 'sent' | 'recv'
  text: string
}

interface Cenario {
  titulo: string
  cliente_nome: string
  hora_inicio: { h: number; m: number }
  notif_hora: string
  mensagens: Mensagem[]
  notificacao: {
    titulo: string
    corpo: string
  }
}

interface DemoData {
  slug: string
  cliente: string
  contato: string
  tipo: string
  cenarios: Cenario[]
  cores: { fundo?: string; primaria?: string; accent?: string } | null
  mensagem_topo: string | null
}

interface ChatMsg extends Mensagem {
  time: string
  id: number
}

interface NotifMsg {
  titulo: string
  corpo: string
  hora: string
}

export default function DemoClient({ demo }: { demo: DemoData }) {
  const [cenarioIdx, setCenarioIdx] = useState(0)
  const [speed, setSpeed] = useState(2)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [notifs, setNotifs] = useState<NotifMsg[]>([])
  const [typing, setTyping] = useState(false)
  const [status, setStatus] = useState('online')
  const [lockClock, setLockClock] = useState('14:32')
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(Date.now())

  const cenarioAtual = demo.cenarios[cenarioIdx]

  useEffect(() => {
    fetch(`/api/demos/${demo.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento: 'demo_aberta' }),
    }).catch(() => {})
  }, [demo.slug])

  useEffect(() => {
    if (cenarioAtual) {
      const t = cenarioAtual.hora_inicio
      setLockClock(`${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`)
    }
    startTimeRef.current = Date.now()
    playScenario()

    return () => clearTimeouts()
  }, [cenarioIdx, speed])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs, typing])

  function clearTimeouts() {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }

  function playScenario() {
    clearTimeouts()
    setChatMsgs([])
    setNotifs([])
    setTyping(false)
    setStatus('online')

    if (!cenarioAtual) return

    const sc = cenarioAtual
    let currentTime = { ...sc.hora_inicio }
    let delay = 800
    const baseDelay = 2400 / speed
    const typingDelay = 1200 / speed
    let msgId = 0

    sc.mensagens.forEach((msg, idx) => {
      if (msg.type === 'recv') {
        timeoutsRef.current.push(setTimeout(() => {
          setTyping(true)
          setStatus('digitando...')
        }, delay))
        delay += typingDelay

        timeoutsRef.current.push(setTimeout(() => {
          setTyping(false)
          setStatus('online')
          currentTime.m += 1
          if (currentTime.m >= 60) { currentTime.h += 1; currentTime.m = 0 }
          const tStr = `${String(currentTime.h).padStart(2, '0')}:${String(currentTime.m).padStart(2, '0')}`
          setChatMsgs(prev => [...prev, { ...msg, time: tStr, id: msgId++ }])
        }, delay))
        delay += baseDelay
      } else {
        timeoutsRef.current.push(setTimeout(() => {
          currentTime.m += 1
          if (currentTime.m >= 60) { currentTime.h += 1; currentTime.m = 0 }
          const tStr = `${String(currentTime.h).padStart(2, '0')}:${String(currentTime.m).padStart(2, '0')}`
          setChatMsgs(prev => [...prev, { ...msg, time: tStr, id: msgId++ }])
        }, delay))
        delay += baseDelay - 600 / speed
      }

      if (idx === sc.mensagens.length - 2) {
        timeoutsRef.current.push(setTimeout(() => {
          setNotifs([{
            titulo: sc.notificacao.titulo,
            corpo: sc.notificacao.corpo,
            hora: sc.notif_hora,
          }])
          setLockClock(sc.notif_hora)
        }, delay))
      }
    })

    timeoutsRef.current.push(setTimeout(() => {
      const duracao = Math.round((Date.now() - startTimeRef.current) / 1000)
      fetch(`/api/demos/${demo.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento: 'cenario_completo',
          cenario: cenarioIdx + 1,
          duracao_segundos: duracao,
        }),
      }).catch(() => {})
    }, delay + 500))
  }

  function trocarCenario(idx: number) {
    const duracao = Math.round((Date.now() - startTimeRef.current) / 1000)
    fetch(`/api/demos/${demo.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: 'troca_cenario',
        cenario: cenarioIdx + 1,
        duracao_segundos: duracao,
      }),
    }).catch(() => {})
    setCenarioIdx(idx)
  }

  if (!cenarioAtual) {
    return <div style={{ padding: 40, color: '#fff', background: '#0D1B2A', minHeight: '100vh' }}>Demo sem cenários.</div>
  }

  const cores = {
    fundo: demo.cores?.fundo || '#0D1B2A',
    primaria: demo.cores?.primaria || '#2E5EAA',
    accent: demo.cores?.accent || '#C8973A',
  }

  return (
    <>
      <style jsx global>{`
        body { margin: 0; padding: 0; }
      `}</style>
      <div style={{
        background: `linear-gradient(135deg, ${cores.fundo} 0%, #1B2A3B 100%)`,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            background: `linear-gradient(90deg, ${cores.primaria}, ${cores.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0',
          }}>
            AlphaOps · Demo {demo.cliente}
          </h1>
          <p style={{ color: cores.accent, fontSize: 14, letterSpacing: 2, margin: 0 }}>
            AUTOMATE · STREAMLINE · EMPOWER
          </p>
          {demo.mensagem_topo && (
            <p style={{ color: '#fff', opacity: 0.85, fontSize: 14, marginTop: 12, maxWidth: 600 }}>
              {demo.mensagem_topo}
            </p>
          )}
          <div style={{ color: '#fff', fontSize: 16, marginTop: 14, opacity: 0.9 }}>
            {cenarioAtual.titulo}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {demo.cenarios.map((c, i) => (
            <button
              key={i}
              onClick={() => trocarCenario(i)}
              style={{
                background: i === cenarioIdx ? cores.primaria : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: i === cenarioIdx ? `1px solid ${cores.primaria}` : '1px solid rgba(255,255,255,0.2)',
                padding: '10px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {i + 1}. {c.titulo.length > 35 ? c.titulo.substring(0, 35) + '...' : c.titulo}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Phone>
            <div style={{ background: '#075E54', color: '#fff', padding: '50px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `linear-gradient(135deg, ${cores.primaria}, ${cores.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16, color: '#fff',
              }}>
                {demo.cliente.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{demo.cliente}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{status}</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 18 }}>📞 ⋮</div>
            </div>

            <div style={{
              flex: 1,
              backgroundColor: '#ECE5DD',
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(0,0,0,0.02) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(0,0,0,0.02) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              overflowY: 'auto',
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              {chatMsgs.map(m => (
                <Message key={m.id} type={m.type} text={m.text} time={m.time} />
              ))}
              {typing && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            <div style={{ background: '#f0f0f0', padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: '#fff', borderRadius: 20, padding: '8px 14px', color: '#999', fontSize: 14 }}>
                Digite uma mensagem
              </div>
              <div style={{
                width: 38, height: 38, background: '#075E54', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18,
              }}>➤</div>
            </div>
          </Phone>

          <Phone>
            <div style={{
              background: 'linear-gradient(135deg, #1a3a5c 0%, #0d1f33 50%, #2c1810 100%)',
              height: '100%',
              color: '#fff',
              padding: '50px 16px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 30, zIndex: 1 }}>
                <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>terça-feira, 5 de maio</div>
                <div style={{ fontSize: 70, fontWeight: 200, lineHeight: 1, letterSpacing: -2 }}>{lockClock}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1 }}>
                {notifs.map((n, i) => (
                  <Notification key={i} titulo={n.titulo} corpo={n.corpo} cores={cores} />
                ))}
              </div>
            </div>
          </Phone>
        </div>

        <div style={{ marginTop: 30, display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={playScenario}
            style={{
              background: `linear-gradient(135deg, ${cores.primaria}, #1e4a8a)`,
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            ↻ Reiniciar
          </button>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.1)', padding: 4, borderRadius: 8 }}>
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  background: speed === s ? cores.accent : 'transparent',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 5,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 30, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          alphaops.cloud · andre@alphaops.cloud · <span style={{ color: cores.accent }}>+1 365 883-3888</span>
        </div>
      </div>
    </>
  )
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 360,
      height: 720,
      background: '#000',
      borderRadius: 50,
      padding: 12,
      boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 2px #1a1a1a',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 110,
        height: 28,
        background: '#000',
        borderRadius: 20,
        zIndex: 10,
      }} />
      <div style={{
        width: '100%',
        height: '100%',
        background: '#ECE5DD',
        borderRadius: 38,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
    </div>
  )
}

function Message({ type, text, time }: { type: 'sent' | 'recv'; text: string; time: string }) {
  const isSent = type === 'sent'
  return (
    <div style={{
      maxWidth: '78%',
      padding: '7px 10px 18px 10px',
      borderRadius: 8,
      borderBottomRightRadius: isSent ? 2 : 8,
      borderBottomLeftRadius: isSent ? 8 : 2,
      fontSize: 14,
      lineHeight: 1.35,
      position: 'relative',
      wordWrap: 'break-word',
      color: '#303030',
      background: isSent ? '#DCF8C6' : '#fff',
      alignSelf: isSent ? 'flex-end' : 'flex-start',
      animation: 'pop 0.25s ease',
    }}>
      {text}
      <span style={{
        fontSize: 10,
        color: isSent ? '#4FC3F7' : '#999',
        position: 'absolute',
        bottom: 3,
        right: 8,
      }}>
        {time}{isSent && ' ✓✓'}
      </span>
      <style jsx>{`
        @keyframes pop {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      background: '#fff',
      alignSelf: 'flex-start',
      padding: '12px 16px',
      borderRadius: 8,
      borderBottomLeftRadius: 2,
      display: 'flex',
      gap: 4,
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7,
          height: 7,
          background: '#999',
          borderRadius: '50%',
          animation: `bounce 1.4s infinite ease-in-out ${i * 0.2}s`,
        }} />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Notification({ titulo, corpo, cores }: { titulo: string; corpo: string; cores: { primaria: string; accent: string } }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 14,
      padding: '12px 14px',
      animation: 'slideIn 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 18,
          height: 18,
          background: `linear-gradient(135deg, ${cores.primaria}, ${cores.accent})`,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
        }}>A</div>
        <div style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>AlphaOps</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>agora</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{titulo}</div>
      <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>{corpo}</div>
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
