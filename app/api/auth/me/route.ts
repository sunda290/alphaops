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
  const role  = req.cookies.get('alphaops-role')?.value
  const token = req.cookies.get('alphaops-token')?.value
  if (!token || !role) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  try {
    const adminApp = getAdminApp()
    const decoded  = await getAuth(adminApp).verifyIdToken(token)
    const snap     = await getFirestore(adminApp).collection('usuarios').doc(decoded.uid).get()
    const nome     = snap.exists ? (snap.data()?.nome || '') : ''
    return NextResponse.json({ role, nome })
  } catch {
    return NextResponse.json({ role, nome: '' })
  }
}
