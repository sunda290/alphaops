import { NextRequest, NextResponse } from 'next/server'

const ETAPAS = [
  {
    id: 1,
    nome: 'Abertura',
    descricao: 'Criar rapport e deixar o lead confortável',
    avancar: 'Se respondeu bem ou demonstrou interesse',
    manter: 'Se foi frio ou ignorou — use o argumento de contorno',
  },
  {
    id: 2,
    nome: 'Identificar Dor',
    descricao: 'Descobrir o gargalo operacional do negócio',
    avancar: 'Se mencionou uma dor clara (tempo, processo, retrabalho)',
    manter: 'Se foi vago — aprofunde com mais uma pergunta',
  },
  {
    id: 3,
    nome: 'Apresentar Solução',
    descricao: 'Mostrar benefício claro e quantificável',
    avancar: 'Se demonstrou curiosidade ou pediu mais detalhes',
    manter: 'Se teve objeção — use o argumento de contorno',
  },
  {
    id: 4,
    nome: 'Propor Diagnóstico',
    descricao: 'Gerar compromisso e senso de exclusividade',
    avancar: 'Se aceitou agendar ou pediu mais informações sobre o diagnóstico',
    manter: 'Se hesitou — reforce que é online, gratuito e sem compromisso',
  },
  {
    id: 5,
    nome: 'Fechar Compromisso',
    descricao: 'Confirmar data e hora, reforçar presença',
    avancar: 'Conversa concluída — lead agendado',
    manter: 'Se agenda apertada — ofereça horários alternativos',
  },
]

export async function POST(req: NextRequest) {
  const role = req.cookies.get('alphaops-role')?.value
  if (!role || (role !== 'ponta_de_lanca' && role !== 'admin')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const { etapa, nicho, nomeLead, nomeUsuario, respostaLead } = await req.json()

    const etapaInfo = ETAPAS[etapa - 1]
    if (!etapaInfo) return NextResponse.json({ error: 'Etapa inválida' }, { status: 400 })

    let prompt = ''

    if (etapa === 1) {
      // Etapa 1 — gera a abertura sem resposta do lead
      prompt = `Você é ${nomeUsuario || 'André'}, especialista em automação operacional para pequenas empresas, ex-Infantaria do Exército Brasileiro.

Você está iniciando uma conversa via WhatsApp com ${nomeLead || 'o lead'}, dono(a) de um(a) ${nicho}.

Gere APENAS a mensagem de abertura — curta, natural, como quem manda um WhatsApp. Tom: direto, humano, sem parecer vendedor. Sem emojis excessivos. Máximo 3 linhas.

A mensagem deve:
- Cumprimentar pelo nome
- Criar rapport rapidamente
- Abrir espaço para conversa sem forçar

Responda APENAS com JSON:
{
  "mensagem": "texto limpo que o lead vai receber",
  "orientacao": "o que o ponta de lança deve observar na resposta",
  "avancar": "${etapaInfo.avancar}",
  "manter": "${etapaInfo.manter}",
  "contorno": "mensagem alternativa se o lead resistir ou não responder"
}`
    } else {
      // Etapas 2-5 — gera resposta com base na resposta do lead
      prompt = `Você é ${nomeUsuario || 'André'}, especialista em automação operacional para pequenas empresas, ex-Infantaria do Exército Brasileiro.

Contexto:
- Lead: ${nomeLead || 'o lead'}, dono(a) de um(a) ${nicho}
- Etapa atual: ${etapaInfo.nome} (${etapaInfo.descricao})
- Resposta do lead: "${respostaLead}"

Gere a resposta para a etapa ${etapaInfo.nome}.

REGRAS IMPORTANTES:
- A mensagem deve ser natural, como um WhatsApp real
- Sem emojis excessivos, sem travessões no meio de frase
- Tom: direto, humano, sem parecer script de vendas
- Máximo 4 linhas
- A mensagem deve fluir naturalmente da resposta do lead

Responda APENAS com JSON:
{
  "mensagem": "texto limpo que o lead vai receber — SEM comentários, SEM orientações, SEM colchetes",
  "orientacao": "análise do tom da resposta do lead e o que isso significa",
  "avancar": "${etapaInfo.avancar}",
  "manter": "${etapaInfo.manter}",
  "contorno": "mensagem alternativa caso o lead apresente objeção ou resistência"
}`
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const texto = data.content?.[0]?.text || '{}'
    const clean = texto.replace(/```json|```/g, '').trim()
    const resultado = JSON.parse(clean)
    return NextResponse.json({ ...resultado, etapa, proximaEtapa: etapa < 5 ? etapa + 1 : null })

  } catch (error) {
    console.error('[roteiro]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
