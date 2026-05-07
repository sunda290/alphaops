import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 })
    }

    const docRef = db.collection('demos').doc(slug)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Demo não encontrada' }, { status: 404 })
    }

    const data = doc.data()

    if (!data?.ativo) {
      return NextResponse.json({ error: 'Demo inativa' }, { status: 404 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referer = req.headers.get('referer') || 'direct'

    docRef.update({
      acessos: FieldValue.arrayUnion({
        timestamp: new Date().toISOString(),
        ip: ip.split(',')[0].trim(),
        userAgent: userAgent.substring(0, 200),
        referer: referer.substring(0, 200),
      }),
      total_acessos: FieldValue.increment(1),
      ultimo_acesso: new Date().toISOString(),
    }).catch(() => {})

    return NextResponse.json({
      slug,
      cliente: data.cliente,
      contato: data.contato,
      tipo: data.tipo,
      cenarios: data.cenarios || [],
      cores: data.cores || null,
      mensagem_topo: data.mensagem_topo || null,
    })
  } catch (err) {
    console.error('Erro ao buscar demo:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { evento, cenario, duracao_segundos } = await req.json()

    if (!slug || !evento) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const docRef = db.collection('demos').doc(slug)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Demo não encontrada' }, { status: 404 })
    }

    docRef.update({
      eventos: FieldValue.arrayUnion({
        timestamp: new Date().toISOString(),
        evento,
        cenario: cenario || null,
        duracao_segundos: duracao_segundos || null,
      }),
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
