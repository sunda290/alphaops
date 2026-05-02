import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// ── Rate limiting simples em memória (por IP, máx 3 req/min) ──────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 3) return true
  entry.count++
  return false
}

// ── Validação ─────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function calcularScore(data: Record<string, string>): number {
  let score = 0
  const scoreOrigem:  Record<string, number> = { indicacao: 40, landing_page: 30, hotelaria: 30, alphaops: 25, linkedin: 20 }
  const scoreProduto: Record<string, number> = { alphaops_full: 40, hotelaria: 40, consultoria: 35, suitelog: 30, ebook: 10 }
  score += scoreOrigem[data.origem]          ?? 0
  score += scoreProduto[data.produto_interesse] ?? 0
  if (data.telefone) score += 15
  if (data.empresa)  score += 10
  if (data.mensagem) score += 5
  return Math.min(score, 100)
}

// ── Notificações ──────────────────────────────────────────────────────────
async function enviarWhatsApp(nome: string, email: string, telefone: string, score: number, temperatura: string, origem: string) {
  const token   = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const to      = process.env.WHATSAPP_TO
  if (!token || !phoneId || !to) return

  const emoji    = temperatura === 'quente' ? '🔥' : temperatura === 'morno' ? '🟡' : '🔵'
  const mensagem = `${emoji} *NOVO LEAD ${temperatura.toUpperCase()}*\n\n👤 *Nome:* ${nome}\n📧 *Email:* ${email}\n📱 *WhatsApp:* ${telefone || 'não informado'}\n📍 *Origem:* ${origem}\n📊 *Score:* ${score}/100\n\n💬 Responder: https://wa.me/${telefone?.replace(/\D/g, '')}`

  await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: mensagem } }),
  })
}

async function enviarEmailLead(nome: string, email: string) {
  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'André Oliveira <onboarding@resend.dev>',
      to:      [email],
      subject: `${nome}, sua sessão está confirmada`,
      html: `
        <div style="background:#000;color:#ede9e0;font-family:sans-serif;padding:48px;max-width:560px;margin:0 auto;">
          <h1 style="font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
            ALPHA<span style="color:#7bc85a;">OPS</span>
          </h1>
          <p style="color:#5a9e42;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:40px;">Operação no nível Alpha</p>
          <p style="font-size:16px;color:#ede9e0;margin-bottom:16px;">${nome},</p>
          <p style="font-size:15px;color:#b5b2a8;line-height:1.7;margin-bottom:24px;">Recebi sua solicitação de Diagnóstico Estratégico.</p>
          <p style="font-size:15px;color:#b5b2a8;line-height:1.7;margin-bottom:24px;">Entro em contato em até <strong style="color:#ede9e0;">24 horas</strong> para confirmar o horário da sua sessão.</p>
          <a href="https://cal.com/andre-oliveira-s290/diagnostico-estrategico"
             style="display:inline-block;background:#c9a84c;color:#000;font-weight:700;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:16px 32px;text-decoration:none;">
            → Agendar minha sessão agora
          </a>
          <div style="margin-top:48px;padding-top:24px;border-top:1px solid #222220;">
            <p style="font-size:12px;color:#8a8880;">André de Souza Oliveira · AlphaOps<br/>Automação Operacional para Pequenas Empresas</p>
          </div>
        </div>
      `,
    }),
  })
}

async function enviarEmailAndre(nome: string, email: string, telefone: string, score: number, temperatura: string, origem: string) {
  const emoji = temperatura === 'quente' ? '🔥' : temperatura === 'morno' ? '🟡' : '🔵'
  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'AlphaOps Sistema <onboarding@resend.dev>',
      to:      ['sunda290@gmail.com'],
      subject: `${emoji} Novo lead ${temperatura.toUpperCase()} — ${nome}`,
      html: `
        <div style="background:#000;color:#ede9e0;font-family:monospace;padding:48px;max-width:560px;margin:0 auto;">
          <h2 style="color:#7bc85a;font-size:14px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">// NOVO LEAD CAPTURADO</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #222220;"><td style="padding:12px 0;color:#8a8880;font-size:12px;">NOME</td><td style="padding:12px 0;color:#ede9e0;font-size:14px;font-weight:bold;">${nome}</td></tr>
            <tr style="border-bottom:1px solid #222220;"><td style="padding:12px 0;color:#8a8880;font-size:12px;">EMAIL</td><td style="padding:12px 0;color:#ede9e0;font-size:14px;">${email}</td></tr>
            <tr style="border-bottom:1px solid #222220;"><td style="padding:12px 0;color:#8a8880;font-size:12px;">WHATSAPP</td><td style="padding:12px 0;color:#ede9e0;font-size:14px;">${telefone || 'não informado'}</td></tr>
            <tr style="border-bottom:1px solid #222220;"><td style="padding:12px 0;color:#8a8880;font-size:12px;">ORIGEM</td><td style="padding:12px 0;color:#ede9e0;font-size:14px;">${origem}</td></tr>
            <tr style="border-bottom:1px solid #222220;"><td style="padding:12px 0;color:#8a8880;font-size:12px;">SCORE</td><td style="padding:12px 0;color:#c9a84c;font-size:20px;font-weight:bold;">${score}/100</td></tr>
            <tr><td style="padding:12px 0;color:#8a8880;font-size:12px;">TEMPERATURA</td><td style="padding:12px 0;font-size:16px;font-weight:bold;color:${temperatura === 'quente' ? '#7bc85a' : temperatura === 'morno' ? '#c9a84c' : '#8a8880'};">${emoji} ${temperatura.toUpperCase()}</td></tr>
          </table>
          <div style="margin-top:32px;">
            <a href="mailto:${email}" style="display:inline-block;background:#7bc85a;color:#000;font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;text-decoration:none;margin-right:12px;">→ Responder</a>
            <a href="https://wa.me/${telefone?.replace(/\D/g,'')}" style="display:inline-block;border:1px solid #222220;color:#8a8880;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;text-decoration:none;">→ WhatsApp</a>
          </div>
        </div>
      `,
    }),
  })
}

// ── Handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Muitas requisições. Aguarde um minuto.' }, { status: 429 })
    }

    const body = await req.json()

    // Validação
    if (!body.nome || typeof body.nome !== 'string' || body.nome.trim().length < 2) {
      return NextResponse.json({ error: 'Nome inválido.' }, { status: 400 })
    }
    if (!body.email || !EMAIL_RE.test(body.email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const score       = calcularScore(body)
    const temperatura = score >= 70 ? 'quente' : score >= 40 ? 'morno' : 'frio'

    const lead = {
      nome:              body.nome.trim(),
      email:             body.email.toLowerCase().trim(),
      telefone:          body.telefone  ?? null,
      empresa:           body.empresa   ?? null,
      setor:             body.setor     ?? null,
      mensagem:          body.mensagem  ?? null,
      origem:            body.origem    ?? 'landing_page',
      produto_interesse: body.produto_interesse ?? 'consultoria',
      score,
      temperatura,
      status:    'novo',
      criado_em: FieldValue.serverTimestamp(),
    }

    const ref = await db.collection('leads').add(lead)

    await Promise.allSettled([
      enviarEmailLead(body.nome, body.email),
      enviarEmailAndre(body.nome, body.email, body.telefone, score, temperatura, body.origem ?? 'landing_page'),
      enviarWhatsApp(body.nome, body.email, body.telefone, score, temperatura, body.origem ?? 'landing_page'),
    ])

    return NextResponse.json({ success: true, leadId: ref.id, score, temperatura }, { status: 201 })

  } catch (error) {
    console.error('[API/leads]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
