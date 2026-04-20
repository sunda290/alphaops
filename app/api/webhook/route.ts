import { NextRequest, NextResponse } from 'next/server'
import { registrarEvento } from '@/lib/leads'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { leadId, evento, canal } = body

    if (!leadId || !evento) {
      return NextResponse.json(
        { error: 'leadId e evento são obrigatórios' },
        { status: 400 }
      )
    }

    const eventosPermitidos = [
      'email_aberto',
      'link_clicado',
      'pagina_visitada',
      'ebook_baixado',
      'agendamento_feito',
      'whatsapp_respondeu',
      'formulario_enviado',
    ]

    if (!eventosPermitidos.includes(evento)) {
      return NextResponse.json(
        { error: 'Evento não reconhecido' },
        { status: 400 }
      )
    }

    await registrarEvento(leadId, evento, canal ?? 'sistema')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/webhook] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno.' },
      { status: 500 }
    )
  }
}
