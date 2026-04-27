import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const [calRes, snapshot] = await Promise.all([
      fetch('https://api.cal.com/v2/bookings', {
        headers: {
          'Authorization': 'Bearer ' + process.env.CAL_API_KEY,
          'cal-api-version': '2024-08-13',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }),
      db.collection('reunioes_manuais').orderBy('criadoEm', 'desc').get()
    ])

    const calData = calRes.ok ? await calRes.json() : { data: [] }

    const calBookings = (calData.data || []).map((b: any) => ({
      id: b.id,
      uid: b.uid,
      title: b.title,
      startTime: b.start,
      endTime: b.end,
      status: b.status?.toUpperCase(),
      attendees: b.attendees || [],
      description: b.description || '',
      manual: false,
    }))

    const manuais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), manual: true }))

    return NextResponse.json({ reunioes: [...calBookings, ...manuais] })
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

    const doc = await db.collection('reunioes_manuais').add({
      title: 'Diagnóstico Estratégico',
      startTime,
      endTime,
      status: 'ACCEPTED',
      attendees: [{ name: nome, email: email || '', phone: telefone || '' }],
      description: observacao || '',
      criadoEm: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, id: doc.id })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { bookingId, manual } = await request.json()

    if (manual) {
      await db.collection('reunioes_manuais').doc(String(bookingId)).delete()
      return NextResponse.json({ ok: true })
    }

    const res = await fetch(`https://api.cal.com/v2/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.CAL_API_KEY,
        'cal-api-version': '2024-08-13',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Cancelado pelo admin' }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
