import { NextResponse } from 'next/server'

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

export async function GET() {
  try {
    const [calRes, fsRes] = await Promise.all([
      fetch('https://api.cal.com/v1/bookings?apiKey=' + process.env.CAL_API_KEY, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }),
      fetch(`${FIRESTORE_URL}/reunioes_manuais`, { cache: 'no-store' })
    ])

    const calData = calRes.ok ? await calRes.json() : { bookings: [] }

    let manuais: any[] = []
    if (fsRes.ok) {
      const fsData = await fsRes.json()
      manuais = (fsData.documents || []).map((doc: any) => {
        const f = doc.fields || {}
        const id = doc.name.split('/').pop()
        return {
          id,
          manual: true,
          title: f.title?.stringValue || 'Diagnóstico Estratégico',
          startTime: f.startTime?.stringValue || '',
          endTime: f.endTime?.stringValue || '',
          status: f.status?.stringValue || 'ACCEPTED',
          attendees: [{ name: f.nome?.stringValue || '', email: f.email?.stringValue || '' }],
          description: f.observacao?.stringValue || '',
        }
      })
    }

    return NextResponse.json({ reunioes: [...(calData.bookings || []), ...manuais] })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, data, hora, observacao } = await request.json()
    if (!nome || !data || !hora) return NextResponse.json({ error: 'Campos obrigatórios: nome, data, hora' }, { status: 400 })

    const startTime = new Date(`${data}T${hora}:00`).toISOString()
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString()

    const res = await fetch(`${FIRESTORE_URL}/reunioes_manuais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          nome: { stringValue: nome },
          email: { stringValue: email || '' },
          telefone: { stringValue: telefone || '' },
          startTime: { stringValue: startTime },
          endTime: { stringValue: endTime },
          status: { stringValue: 'ACCEPTED' },
          observacao: { stringValue: observacao || '' },
          title: { stringValue: 'Diagnóstico Estratégico' },
          criadoEm: { stringValue: new Date().toISOString() },
        }
      })
    })

    if (!res.ok) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { bookingId, manual } = await request.json()

    if (manual) {
      await fetch(`${FIRESTORE_URL}/reunioes_manuais/${bookingId}`, { method: 'DELETE' })
      return NextResponse.json({ ok: true })
    }

    const res = await fetch(`https://api.cal.com/v1/bookings/${bookingId}/cancel?apiKey=${process.env.CAL_API_KEY}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Cancelado pelo admin' }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
