import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

const VERIFY_TOKEN = 'alphaops_webhook_2026'
const WA_TOKEN    = process.env.WHATSAPP_TOKEN!
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID!
const CAL_LINK    = 'https://cal.com/andre-oliveira-s290/diagnostico-estrategico'

// Verificação do webhook pela Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[webhook] verificado')
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// Receber mensagens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages?.length) return NextResponse.json({ ok: true })

    const msg  = messages[0]
    const from = msg.from // número do lead
    const text = msg.text?.body?.trim().toLowerCase() || ''

    // Buscar estado da conversa
    const convRef  = doc(db, 'conversas', from)
    const convSnap = await getDoc(convRef)
    const conv     = convSnap.exists() ? convSnap.data() : { etapa: 0, dados: {} }

    await processarMensagem(from, text, conv, convRef)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[webhook/POST]', error)
    return NextResponse.json({ ok: true })
  }
}

async function processarMensagem(from: string, text: string, conv: any, convRef: any) {
  const etapa = conv.etapa || 0
  const dados = conv.dados || {}

  if (etapa === 0) {
    // Primeira resposta do lead
    await enviarMensagem(from,
      `Oi! Obrigado por responder.\n\nPara eu entender como posso ajudar, me conta: *qual é o seu negócio?* O que você vende ou oferece?`
    )
    await setDoc(convRef, { etapa: 1, dados: {}, atualizado_em: serverTimestamp() })
    return
  }

  if (etapa === 1) {
    // Recebeu o negócio
    dados.negocio = text
    await enviarMensagem(from,
      `Entendido!\n\nAgora me diz: *qual é a maior dificuldade operacional hoje?*\n\nPode ser atendimento, follow-up de clientes, relatórios, agendamento... qualquer coisa que toma tempo ou trava o crescimento.`
    )
    await updateDoc(convRef, { etapa: 2, dados, atualizado_em: serverTimestamp() })
    return
  }

  if (etapa === 2) {
    // Recebeu a dor
    dados.dor = text
    await enviarMensagem(from,
      `Faz sentido.\n\nÚltima pergunta: *quantas pessoas trabalham no negócio hoje?*`
    )
    await updateDoc(convRef, { etapa: 3, dados, atualizado_em: serverTimestamp() })
    return
  }

  if (etapa === 3) {
    // Recebeu o tamanho da equipe
    dados.equipe = text

    // Calcular score
    const score = calcularScore(dados)
    const temperatura = score >= 60 ? 'quente' : 'morno'

    // Salvar lead no Firebase
    await setDoc(doc(db, 'leads', from), {
      telefone:  from,
      negocio:   dados.negocio,
      dor:       dados.dor,
      equipe:    dados.equipe,
      score,
      temperatura,
      origem:    'whatsapp_bot',
      status:    'novo',
      criado_em: serverTimestamp(),
    })

    if (temperatura === 'quente') {
      await enviarMensagem(from,
        `Pelo que você me contou, consigo ajudar.\n\nO próximo passo é um *Diagnóstico Estratégico gratuito* — 60 minutos por videochamada onde mapeamos sua operação e você sai com o plano exato de automação.\n\nAgenda aqui no horário que for melhor para você:\n${CAL_LINK}`
      )
    } else {
      await enviarMensagem(from,
        `Entendi o cenário.\n\nVou te mandar algumas informações sobre como a automação pode ajudar no seu caso. Se fizer sentido, podemos marcar uma conversa rápida.\n\nAqui está o link para conhecer melhor o trabalho:\nhttps://alphaops-six.vercel.app`
      )
    }

    // Notificar André
    await notificarAndre(from, dados, score, temperatura)

    // Encerrar conversa
    await updateDoc(convRef, { etapa: 99, dados, atualizado_em: serverTimestamp() })
    return
  }

  // Conversa encerrada — não responder
  if (etapa === 99) return
}

function calcularScore(dados: any): number {
  let score = 40 // base whatsapp outbound
  const dor = dados.dor?.toLowerCase() || ''
  const equipe = dados.equipe || ''

  // Dores de alto valor
  if (dor.includes('cliente') || dor.includes('atendimento')) score += 20
  if (dor.includes('follow') || dor.includes('resposta')) score += 20
  if (dor.includes('relatório') || dor.includes('controle')) score += 15
  if (dor.includes('tempo') || dor.includes('manual')) score += 15

  // Tamanho da equipe
  const num = parseInt(equipe)
  if (!isNaN(num)) {
    if (num >= 3) score += 10
    if (num >= 5) score += 10
  }

  return Math.min(score, 100)
}

async function enviarMensagem(to: string, texto: string) {
  await fetch(`https://graph.facebook.com/v25.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: texto },
    }),
  })
}

async function notificarAndre(from: string, dados: any, score: number, temperatura: string) {
  const emoji = temperatura === 'quente' ? '🔥' : '🟡'
  const msg = `${emoji} LEAD ${temperatura.toUpperCase()} VIA BOT\n\nTelefone: +${from}\nNegócio: ${dados.negocio}\nDor: ${dados.dor}\nEquipe: ${dados.equipe}\nScore: ${score}/100`

  await fetch(`https://graph.facebook.com/v25.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: process.env.WHATSAPP_TO,
      type: 'text',
      text: { body: msg },
    }),
  })
}
