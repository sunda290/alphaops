import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

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

function calcularScore(data: Record<string, string>): number {
  let score = 0
  const scoreOrigem: Record<string, number> = { indicacao: 40, landing_page: 30, hotelaria: 30, alphaops: 25, linkedin: 20 }
  const scoreProduto: Record<string, number> = { alphaops_full: 40, hotelaria: 40, consultoria: 35, suitelog: 30, ebook: 10 }
  score += scoreOrigem[data.origem] ?? 0
  score += scoreProduto[data.produto_interesse] ?? 0
  if (data.telefone) score += 15
  if (data.empresa)  score += 10
  if (data.mensagem) score += 5
  return Math.min(score, 100)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.nome || !body.email) {
      return NextResponse.json({ error: 'Nome e email obrigatórios' }, { status: 400 })
    }
    const score = calcularScore(body)
    const temperatura = score >= 70 ? 'quente' : score >= 40 ? 'morno' : 'frio'
    const lead = {
      nome:              body.nome,
      email:             body.email,
      telefone:          body.telefone  ?? null,
      empresa:           body.empresa   ?? null,
      setor:             body.setor     ?? null,
      mensagem:          body.mensagem  ?? null,
      origem:            body.origem    ?? 'landing_page',
      produto_interesse: body.produto_interesse ?? 'consultoria',
      score,
      temperatura,
      status:    'novo',
      criado_em: serverTimestamp(),
    }
    const ref = await addDoc(collection(db, 'leads'), lead)
    return NextResponse.json({ success: true, leadId: ref.id, score, temperatura }, { status: 201 })
  } catch (error) {
    console.error('[API/leads]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
