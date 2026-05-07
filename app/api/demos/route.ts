import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

function checkAdmin(req: NextRequest) {
  const role = req.cookies.get('alphaops-role')?.value
  return role === 'admin'
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const snap = await db.collection('demos').orderBy('criado_em', 'desc').get()
    const demos = snap.docs.map(d => ({ slug: d.id, ...d.data() }))
    return NextResponse.json({ demos })
  } catch (err) {
    console.error('Erro listar demos:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { slug, cliente, contato, tipo, cenarios, ativo, cores, mensagem_topo } = body

    if (!slug || !cliente || !cenarios || !Array.isArray(cenarios)) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const slugLimpo = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')

    const existing = await db.collection('demos').doc(slugLimpo).get()
    if (existing.exists) {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 409 })
    }

    await db.collection('demos').doc(slugLimpo).set({
      cliente,
      contato: contato || '',
      tipo: tipo || 'geral',
      cenarios,
      ativo: ativo !== false,
      cores: cores || null,
      mensagem_topo: mensagem_topo || null,
      acessos: [],
      eventos: [],
      total_acessos: 0,
      ultimo_acesso: null,
      criado_em: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, slug: slugLimpo })
  } catch (err) {
    console.error('Erro criar demo:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { slug, ...updates } = body

    if (!slug) {
      return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 })
    }

    delete updates.acessos
    delete updates.eventos
    delete updates.total_acessos
    delete updates.criado_em

    await db.collection('demos').doc(slug).update({
      ...updates,
      atualizado_em: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro atualizar demo:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const { slug } = await req.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 })
    }

    await db.collection('demos').doc(slug).delete()
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro deletar demo:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
