import { NextRequest, NextResponse } from 'next/server'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) })
}
const adminDb = getFirestore()

export async function GET(req: NextRequest) {
  const role = req.cookies.get('alphaops-role')?.value
  if (role !== 'admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const snap = await adminDb.collection('usuarios').get()
  const usuarios = snap.docs.map(d => d.data())
  return NextResponse.json({ usuarios })
}
