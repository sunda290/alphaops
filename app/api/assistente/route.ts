import { NextRequest, NextResponse } from 'next/server'

const ANDRE_CONTEXT = `Você é o assistente de vendas de André de Souza Oliveira.

SOBRE ANDRÉ:
- Coronel Veterano do Exército Brasileiro
- Especialista em automação operacional para pequenas empresas
- Desenvolve sistemas customizados com IA e Full Stack
- Trabalha 100% remoto, atende por indicação, vagas limitadas

SERVIÇOS:
1. Diagnóstico Estratégico (gratuito, 60 min)
2. Automação com IA - follow-up automático, relatórios, atendimento 24h
3. Sistema Customizado (AlphaOps) - plataforma sob medida
4. Dashboard em Tempo Real - visibilidade total no celular

TOM DE VOZ:
- Direto, sem enrolação, sem emojis excessivos
- Sem travessões no meio das frases
- Natural, como um profissional confiante
- Perguntas cirúrgicas para qualificar
- Nunca dá preço antes de entender o problema
- Conecta o problema do lead com solução específica`

export async function POST(req: NextRequest) {
  try {
    const { mensagem, nome, segmento, contexto, objetivo } = await req.json()

    if (!mensagem) {
      return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 })
    }

    const goalMap: Record<string, string> = {
      qualificar: 'Qualificar o lead fazendo perguntas para entender o problema e o negócio.',
      proposta: 'Apresentar o valor do que André faz de forma específica para este lead.',
      fechar: 'Mover o lead para o próximo passo: diagnóstico gratuito ou proposta formal.',
      objecao: 'Responder uma objeção ou hesitação do lead de forma direta e sem pressão.',
    }

    const prompt = `${ANDRE_CONTEXT}

---

DADOS DO LEAD:
Nome: ${nome || 'não informado'}
Segmento: ${segmento || 'não informado'}
Contexto anterior: ${contexto || 'nenhum'}
Objetivo desta resposta: ${goalMap[objetivo] || goalMap.qualificar}

MENSAGEM DO LEAD:
"${mensagem}"

---

Escreva a resposta que André deve enviar para este lead.
Seja direto, natural, sem emojis excessivos, sem travessões no meio das frases.
Máximo 5 parágrafos curtos.
Termine com uma pergunta ou chamada para ação clara.
Não use saudações genéricas como "Olá" ou "Prezado".`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const texto = data.content?.[0]?.text

    if (!texto) throw new Error('Resposta vazia da API')

    return NextResponse.json({ resposta: texto })

  } catch (error) {
    console.error('[API/assistente]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
