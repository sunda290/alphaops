import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.cal.com/v1/bookings?apiKey=' + process.env.CAL_API_KEY, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar reuniões' }, { status: 500 })
    const data = await res.json()
    return NextResponse.json({ reunioes: data.bookings || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { bookingId } = await request.json()
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
