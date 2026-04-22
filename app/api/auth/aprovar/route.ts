import { NextRequest, NextResponse } from 'next/server'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) })
}
const adminDb = getFirestore()

export async function POST(req: NextRequest) {
  try {
    const role = req.cookies.get('alphaops-role')?.value
    if (role !== 'admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    const { uid, acao } = await req.json()
    if (acao === 'aprovar') await adminDb.collection('usuarios').doc(uid).update({ role: 'ponta_de_lanca', status: 'aprovado' })
    else if (acao === 'bloquear') await adminDb.collection('usuarios').doc(uid).update({ status: 'bloqueado' })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
