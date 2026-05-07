import { db } from '../lib/firebase-admin'

const SLUG = 'cake-velvet-2026'

const cenarios = [
  {
    titulo: 'Páscoa - encomenda de ovo de colher',
    cliente_nome: 'Letícia',
    hora_inicio: { h: 19, m: 32 },
    notif_hora: '19:38',
    mensagens: [
      { type: 'sent', text: 'Oi! Vi o ovo de colher de vocês no Instagram, ainda dá tempo de encomendar pra Páscoa?' },
      { type: 'sent', text: 'Quero 3, é pra dar de presente pra família' },
      { type: 'recv', text: 'Oii Letícia, que bom te ver por aqui! Sou a Alpha, atendo aqui na Cake For You enquanto a Mari tá na cozinha 💛' },
      { type: 'recv', text: 'Tem espaço sim, mas a agenda da Páscoa tá fechando rápido. Pra eu já reservar os 3 ovos com a Mari, me conta:' },
      { type: 'recv', text: 'Os 3 ovos vão ser todos do mesmo recheio ou cada um diferente? Os recheios disponíveis esse ano são: ninho com Nutella, brigadeiro tradicional, beijinho, doce de leite com nozes e churros' },
      { type: 'sent', text: 'Quero um de ninho com Nutella, um de brigadeiro e um de doce de leite' },
      { type: 'recv', text: 'Anotado! 1 ninho com Nutella, 1 brigadeiro, 1 doce de leite com nozes. Os 3 são de 250g, sai $36 cada, total $108' },
      { type: 'recv', text: 'Você tá em qual cidade? Entregamos em Kitchener, Waterloo e Cambridge ($5 por entrega) ou pode retirar grátis na Hoffman Street, em Kitchener' },
      { type: 'sent', text: 'Sou de Waterloo. Pode entregar?' },
      { type: 'recv', text: 'Perfeito! 3 ovos + entrega Waterloo = $113 no total' },
      { type: 'recv', text: 'A Mari trabalha com 50% por e-transfer pra confirmar o pedido (marianesantana56@gmail.com) e os outros 50% você paga na entrega' },
      { type: 'recv', text: 'A Páscoa cai dia 5 de abril esse ano. Preferência de entrega: 3, 4 ou 5 de abril?' },
      { type: 'sent', text: 'Pode ser dia 4 de manhã' },
      { type: 'recv', text: 'Reservado! 3 ovos pra entrega sábado 4/abr de manhã em Waterloo' },
      { type: 'recv', text: 'Vou mandar agora a chave e-transfer pra você confirmar os $56,50. Assim que cair, a Mari já bloqueia tua data e começa a produção 💛' },
    ],
    notificacao: {
      titulo: '🔥 PEDIDO PÁSCOA — Letícia',
      corpo: '3 ovos 250g (ninho/Nutella, brigadeiro, doce leite c/ nozes) · Waterloo · entrega 4/abr manhã · $113 · aguardando e-transfer 50%',
    },
  },
  {
    titulo: 'Cliente Cambridge perguntando frete e prazo',
    cliente_nome: 'Daniela',
    hora_inicio: { h: 14, m: 18 },
    notif_hora: '14:24',
    mensagens: [
      { type: 'sent', text: 'Boa tarde, vocês entregam em Cambridge?' },
      { type: 'sent', text: 'Queria um bolo pro fim de semana, sábado se possível' },
      { type: 'recv', text: 'Boa tarde Daniela! Sim, entregamos em Cambridge sim 💛 Frete fica $5' },
      { type: 'recv', text: 'Sábado tá tranquilo, o ideal é fechar o pedido até quinta pra Mari conseguir produzir com calma' },
      { type: 'recv', text: 'Pra eu te passar opção certinha, me conta: o bolo é pra quantas pessoas? Tem ocasião especial (aniversário, chá de bebê, comemoração) ou é pra um momento mais tranquilo em família?' },
      { type: 'sent', text: 'É pro aniversário do meu marido, vamos ser uns 12' },
      { type: 'recv', text: 'Ai que delícia 💛 Pra 12 pessoas o ideal é um bolo de 2 andares ou um andar grande de 25cm' },
      { type: 'recv', text: 'A Mari faz alguns sabores que são queridinhos pra aniversário: prestígio, ninho com morango, brigadeiro com morango, churros e dois amores (chocolate + ninho). Algum desses te chama atenção?' },
      { type: 'sent', text: 'Ele ama prestígio. Quanto fica?' },
      { type: 'recv', text: 'Ótima escolha! Bolo de prestígio 25cm pra 12 pessoas, com decoração simples (não é bolo personalizado de modelagem) fica $85 + $5 de frete Cambridge = $90 total' },
      { type: 'recv', text: 'Se quiser bolo personalizado com tema (foto, modelagem, tema específico) o orçamento é sob medida e a Mari mesmo te passa, pra esses ela conversa direto' },
      { type: 'sent', text: 'Não, simples mesmo tá ótimo. Pode reservar' },
      { type: 'recv', text: 'Reservado! Bolo prestígio 25cm pra sábado, entrega Cambridge, $90' },
      { type: 'recv', text: 'Pagamento é 50% e-transfer agora pra confirmar (marianesantana56@gmail.com) e 50% na entrega. Mando a chave aqui?' },
      { type: 'sent', text: 'Pode mandar' },
      { type: 'recv', text: 'Indo! Assim que cair os $45 a Mari confirma e te chama na quinta pra alinhar horário da entrega 💛' },
    ],
    notificacao: {
      titulo: '🎂 NOVO PEDIDO — Daniela',
      corpo: 'Aniversário marido · 12 pessoas · prestígio 25cm · Cambridge sábado · $90 · aguardando e-transfer 50%',
    },
  },
  {
    titulo: 'Cliente nervoso com pedido urgente em 24h',
    cliente_nome: 'Camila',
    hora_inicio: { h: 21, m: 47 },
    notif_hora: '21:55',
    mensagens: [
      { type: 'sent', text: 'Oi, socorro!! Preciso de um bolo pra amanhã' },
      { type: 'sent', text: 'É aniversário da minha filha de 8 anos, eu esqueci de encomendar 😭' },
      { type: 'sent', text: 'Vocês conseguem fazer? Pago o que for' },
      { type: 'recv', text: 'Camila respira fundo 💛 vou ver o que dá pra fazer com você' },
      { type: 'recv', text: 'Pedidos com menos de 48h a Mari precisa avaliar a agenda dela pessoalmente porque depende do que já tá produzindo amanhã. Mas vou te conectar com ela direto pra resolver isso ainda hoje' },
      { type: 'recv', text: 'Antes de eu chamar ela, me conta tudo de uma vez pra adiantar:' },
      { type: 'recv', text: 'Qual o tema da festa (princesa, unicórnio, personagem específico, tema livre)? Pra quantas pessoas é o bolo? Você tá em qual cidade? E que horas é a festa amanhã?' },
      { type: 'sent', text: 'É tema Frozen, Elsa. Pra uns 15 amiguinhos. Estou em Kitchener. A festa é às 15h' },
      { type: 'recv', text: 'Anotei tudo. Frozen tema Elsa, 15 pessoas, Kitchener, festa 15h amanhã' },
      { type: 'recv', text: 'Sendo bem direto com você: bolo personalizado de modelagem (Elsa em 3D, castelo de gelo, etc) em 16h não dá. Mas a Mari consegue fazer um bolo lindíssimo de 2 andares azul e branco com topper da Elsa em papel de arroz, pérolas comestíveis e flocos de gelo. Visualmente fica encantador, e a tua filha vai amar' },
      { type: 'recv', text: 'Sabor mais comum pra criança 8 anos: brigadeiro de morango, ninho com morango ou dois amores. Algum desses?' },
      { type: 'sent', text: 'Ela ama brigadeiro de morango! Quanto fica?' },
      { type: 'recv', text: 'Bolo 2 andares azul/branco com topper Elsa, brigadeiro com morango, pra 15 pessoas: $145' },
      { type: 'recv', text: 'Entrega em Kitchener no dia da festa às 13h pra você ter tempo de montar a mesa antes dos convidados chegarem. Frete $5' },
      { type: 'recv', text: 'Camila, tô chamando a Mari agora pra ela confirmar se topa fazer fora do prazo. Já adianta o e-transfer dos 50% ($75) pra marianesantana56@gmail.com pra ela já bloquear a noite e começar' },
      { type: 'sent', text: 'Já mandei!! Obrigada Alpha, salvou a vida' },
      { type: 'recv', text: 'Que bom Camila 💛 a Mari já tá vendo aqui e vai te chamar em alguns minutos. Sua filha vai ter o bolo da Elsa amanhã, fica tranquila' },
    ],
    notificacao: {
      titulo: '🚨 URGENTE — Camila',
      corpo: 'Aniv filha 8 anos AMANHÃ 15h · 15 pessoas · Frozen/Elsa · Kitchener · $145 · brigadeiro morango · e-transfer recebido · LIGAR AGORA',
    },
  },
]

async function seed() {
  console.log(`Criando demo: ${SLUG}`)

  const docRef = db.collection('demos').doc(SLUG)
  const existing = await docRef.get()

  if (existing.exists) {
    console.log('Demo já existe. Sobrescrevendo...')
  }

  await docRef.set({
    cliente: 'Cake For You',
    contato: 'Mariane',
    tipo: 'confeitaria',
    cenarios,
    ativo: true,
    cores: {
      fundo: '#0D1B2A',
      primaria: '#2E5EAA',
      accent: '#C8973A',
    },
    mensagem_topo: 'Demonstração privada feita pra Cake For You. Cenários reais da operação da Mariane: encomenda de Páscoa com pico de demanda, cliente de Cambridge perguntando frete, e mãe desesperada com pedido urgente pra amanhã.',
    acessos: [],
    eventos: [],
    total_acessos: 0,
    ultimo_acesso: null,
    criado_em: new Date().toISOString(),
  })

  console.log(`✓ Demo criada com sucesso`)
  console.log(`  URL: https://alphaops.cloud/demo/${SLUG}`)
  console.log(`  Admin: https://alphaops.cloud/admin/demos`)
  process.exit(0)
}

seed().catch(err => {
  console.error('Erro:', err)
  process.exit(1)
})
