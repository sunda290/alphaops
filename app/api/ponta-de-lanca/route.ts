import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const role = req.cookies.get('alphaops-role')?.value
  if (!role || (role !== 'ponta_de_lanca' && role !== 'admin')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }
  try {
    const { nicho } = await req.json()
    if (!nicho) return NextResponse.json({ error: 'Nicho obrigatório' }, { status: 400 })

    const prompt = `Você é o assistente de André de Souza Oliveira, ex-Infantaria do Exército Brasileiro, especialista em automação operacional para pequenas empresas.

O Wallace é o ponta de lança de André. Ele aborda donos de estabelecimentos para apresentar André e marcar um diagnóstico gratuito.

Gere o material de abordagem para o nicho: "${nicho}"

Responda APENAS em JSON válido, sem markdown, sem explicações, exatamente neste formato:
{
  "abordagem": "mensagem curta para o Wallace enviar no privado do dono. Tom íntimo, direto, como quem está passando um bizu. Máximo 5 linhas. Sem emojis excessivos. Sem travessões.",
  "cartao": "cartão de visita digital formatado para WhatsApp com *negrito* nos títulos. Apresenta André, seus 3 serviços aplicados ao nicho específico, e o link alphaops-six.vercel.app",
  "roteiro": "roteiro de conversa com 5 etapas: 1-Abertura, 2-Identificar dor do nicho, 3-Apresentar solução, 4-Propor diagnóstico, 5-Fechar. Cada etapa com a fala sugerida e o que fazer se o lead resistir."
}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    })

    const data = await res.json()
    const texto = data.content?.[0]?.text || '{}'
    const clean = texto.replace(/```json|```/g, '').trim()
    const resultado = JSON.parse(clean)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('[ponta-de-lanca]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
