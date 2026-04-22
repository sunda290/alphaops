import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const adminAuth = getAuth()
const adminDb   = getFirestore()

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid
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
    console.error('[API/auth/login]', error)
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}
