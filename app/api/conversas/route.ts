import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('alphaops-token')?.value
  const role  = req.cookies.get('alphaops-role')?.value
  if (!token || !role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const adminApp = getAdminApp()
    const decoded  = await getAuth(adminApp).verifyIdToken(token)
    const db       = getFirestore(adminApp)

    let query: FirebaseFirestore.Query = db.collection('conversas_ponta')
    if (role !== 'admin') {
      query = query.where('usuario_uid', '==', decoded.uid)
    }
    query = query.limit(50)

    const snap = await query.get()
    const conversas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ conversas })
  } catch (error) {
    console.error('[conversas/GET]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('alphaops-token')?.value
  const role  = req.cookies.get('alphaops-role')?.value
  if (!token || !role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const adminApp = getAdminApp()
    const decoded  = await getAuth(adminApp).verifyIdToken(token)
    const db       = getFirestore(adminApp)
    const body     = await req.json()

    const { id, nicho, nomeLead, whatsapp, nomeUsuario, etapas, etapaAtual } = body

    const dados = {
      usuario_uid:  decoded.uid,
      nome_usuario: nomeUsuario || '',
      nicho,
      nome_lead:    nomeLead || '',
      whatsapp:     whatsapp || '',
      etapas:       etapas || [],
      etapa_atual:  etapaAtual || 0,
      atualizado_em: new Date().toISOString(),
    }

    if (id) {
      await db.collection('conversas_ponta').doc(id).update(dados)
      return NextResponse.json({ id })
    } else {
      const ref = await db.collection('conversas_ponta').add({
        ...dados,
        criado_em: new Date().toISOString(),
      })
      return NextResponse.json({ id: ref.id })
    }
  } catch (error) {
    console.error('[conversas/POST]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('alphaops-token')?.value
  const role  = req.cookies.get('alphaops-role')?.value
  if (!token || !role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const adminApp = getAdminApp()
    const decoded  = await getAuth(adminApp).verifyIdToken(token)
    const db       = getFirestore(adminApp)
    const { id }   = await req.json()

    const doc = await db.collection('conversas_ponta').doc(id).get()
    if (!doc.exists) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const data = doc.data()!
    if (role !== 'admin' && data.usuario_uid !== decoded.uid) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    await db.collection('conversas_ponta').doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[conversas/DELETE]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
