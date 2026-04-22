import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]
  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(`Vars faltando: projectId=${!!projectId} clientEmail=${!!clientEmail} privateKey=${!!privateKey}`)
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })

    let adminApp
    try {
      adminApp = getAdminApp()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[login] getAdminApp falhou:', msg)
      return NextResponse.json({ error: 'Config error', detail: msg }, { status: 500 })
    }

    const adminAuth = getAuth(adminApp)
    const adminDb   = getFirestore(adminApp)

    let uid: string
    try {
      const decoded = await adminAuth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[login] verifyIdToken falhou:', msg)
      return NextResponse.json({ error: 'Token inválido', detail: msg }, { status: 401 })
    }

    const snap = await adminDb.collection('usuarios').doc(uid).get()
    if (!snap.exists) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const profile = snap.data()!
    if (profile.status === 'pendente') return NextResponse.json({ error: 'pendente' }, { status: 403 })
    if (profile.status === 'bloqueado') return NextResponse.json({ error: 'bloqueado' }, { status: 403 })

    const res = NextResponse.json({ success: true, role: profile.role })
    res.cookies.set('alphaops-token', idToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60*60*24*7, path: '/' })
    res.cookies.set('alphaops-role', profile.role, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60*60*24*7, path: '/' })
    return res

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[API/auth/login] erro geral:', msg)
    return NextResponse.json({ error: 'Erro interno', detail: msg }, { status: 500 })
  }
}
