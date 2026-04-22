import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)

// Tipos de usuário
export type UserRole = 'admin' | 'ponta_de_lanca' | 'pendente'

export interface UserProfile {
  uid: string
  email: string
  nome: string
  role: UserRole
  status: 'pendente' | 'aprovado' | 'bloqueado'
  criado_em: unknown
}

// Criar conta
export async function signUp(email: string, senha: string, nome: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha)
  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    uid:       cred.user.uid,
    email,
    nome,
    role:      'pendente',
    status:    'pendente',
    criado_em: serverTimestamp(),
  })
  return cred.user
}

// Login
export async function signIn(email: string, senha: string) {
  const cred = await signInWithEmailAndPassword(auth, email, senha)
  const profile = await getUserProfile(cred.user.uid)
  return { user: cred.user, profile }
}

// Logout
export async function logOut() {
  await signOut(auth)
}

// Buscar perfil do usuário
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  return snap.exists() ? snap.data() as UserProfile : null
}

// Aprovar usuário (admin)
export async function aprovarUsuario(uid: string) {
  await updateDoc(doc(db, 'usuarios', uid), {
    role:   'ponta_de_lanca',
    status: 'aprovado',
  })
}

// Bloquear usuário (admin)
export async function bloquearUsuario(uid: string) {
  await updateDoc(doc(db, 'usuarios', uid), {
    status: 'bloqueado',
  })
}

// Listar todos os usuários (admin)
export async function listarUsuarios(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'usuarios'))
  return snap.docs.map(d => d.data() as UserProfile)
}
