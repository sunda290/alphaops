import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, uid } = await req.json()
    const msg = `🔔 NOVO CADASTRO PENDENTE\n\nNome: ${nome}\nEmail: ${email}\n\nAprovar em: alphaops-six.vercel.app/admin`
    const token = process.env.WHATSAPP_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_ID
    const to = process.env.WHATSAPP_TO
    if (token && phoneId && to) {
      await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: msg } }),
      })
    }
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'AlphaOps Sistema <onboarding@resend.dev>',
          to: ['sunda290@gmail.com'],
          subject: `🔔 Novo cadastro pendente — ${nome}`,
          html: `<div style="font-family:monospace;background:#000;color:#ede9e0;padding:40px;"><h2 style="color:#7bc85a;">NOVO CADASTRO PENDENTE</h2><p>Nome: <strong>${nome}</strong></p><p>Email: <strong>${email}</strong></p><br/><a href="https://alphaops-six.vercel.app/admin" style="background:#7bc85a;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;">→ Aprovar no painel</a></div>`,
        }),
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
