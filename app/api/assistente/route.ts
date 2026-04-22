import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { mensagem, nome, segmento, contexto, objetivo } = await req.json()

    if (!mensagem) {
      return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key não configurada', debug: 'ANTHROPIC_API_KEY missing' }, { status: 500 })
    }

    const ANDRE_CONTEXT = `Você é o assistente de vendas de André de Souza Oliveira.
Ex-Infantaria do Exército Brasileiro. Especialista em automação operacional para pequenas empresas.
Desenvolve sistemas customizados com IA e Full Stack. Trabalha 100% remoto, atende por indicação.

SERVIÇOS:
1. Diagnóstico Estratégico gratuito 60 min
2. Automação com IA - follow-up automático, relatórios, atendimento 24h
3. Sistema Customizado AlphaOps - plataforma sob medida
4. Dashboard em Tempo Real

TOM: direto, sem enrolação, sem emojis, sem travessões no meio das frases, natural e confiante.`

    const goalMap: Record<string, string> = {
      qualificar: 'Qualificar o lead fazendo perguntas para entender o problema e o negócio.',
      proposta: 'Apresentar o valor do que André faz de forma específica para este lead.',
      fechar: 'Mover o lead para diagnóstico gratuito ou proposta formal.',
      objecao: 'Responder uma objeção de forma direta e sem pressão.',
    }

    const prompt = `${ANDRE_CONTEXT}

LEAD: ${nome || 'não informado'} | Segmento: ${segmento || 'não informado'}
Contexto: ${contexto || 'nenhum'}
Objetivo: ${goalMap[objetivo] || goalMap.qualificar}

MENSAGEM DO LEAD:
"${mensagem}"

Escreva a resposta de André. Máximo 5 parágrafos curtos. Termine com pergunta ou CTA.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: 'Erro na API Anthropic', detail: data }, { status: 500 })
    }

    const texto = data.content?.[0]?.text
    if (!texto) throw new Error('Resposta vazia')

    return NextResponse.json({ resposta: texto })

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
