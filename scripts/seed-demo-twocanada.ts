import { db } from '../lib/firebase-admin'

const SLUG = 'tc-aurora-2026'

const cenarios = [
  {
    titulo: 'Família planejando Banff em julho',
    cliente_nome: 'Marina',
    hora_inicio: { h: 14, m: 32 },
    notif_hora: '14:38',
    mensagens: [
      { type: 'sent', text: 'Oi! Vi vocês no Instagram. Tô planejando uma viagem em julho com meu marido e duas filhas (10 e 14 anos)' },
      { type: 'sent', text: 'É a primeira vez no Canadá. Vocês fazem pacote pra família?' },
      { type: 'recv', text: 'Oi Marina, que ótimo te ver por aqui! Sou a Alpha, recepciono os primeiros contatos da TwoCanada enquanto o Joel está em campo guiando 😊' },
      { type: 'recv', text: 'Adoramos receber famílias e Banff em julho é simplesmente espetacular. Lagos no auge da cor turquesa, dias longos, clima perfeito pra trilhas leves com crianças' },
      { type: 'recv', text: 'Pra eu já adiantar tudo pro Joel, me conta:' },
      { type: 'recv', text: 'Vocês chegam em Calgary ou Vancouver? Já têm hospedagem ou querem que a gente sugira hotéis em Banff/Lake Louise? Quantos dias de tour vocês querem com a gente?' },
      { type: 'sent', text: 'Chegamos em Calgary dia 18/jul. Ainda não temos hotel. Pensamos em uns 4 dias de tour' },
      { type: 'recv', text: 'Perfeito! Com 4 dias dá pra fazer um roteiro completo: city tour Calgary no dia da chegada, Banff e Lake Louise, Icefields Parkway até a geleira Athabasca, e Moraine Lake' },
      { type: 'recv', text: 'O Joel é o guia, motorista e fotógrafo de vocês. Tudo em SUV premium com champagne de boas-vindas pros adultos e cookies pras meninas 🍪' },
      { type: 'recv', text: 'Tour familiar privativo de 4 dias com fotos profissionais incluídas, ticket de referência fica em CAD $4.800 a $6.200 dependendo da hospedagem escolhida' },
      { type: 'recv', text: 'Quer que o Joel te chame pra alinhar detalhes ainda hoje? Ele responde por volta das 19h quando termina o tour de hoje' },
      { type: 'sent', text: 'Quero sim! Pode pedir pra ele me chamar' },
      { type: 'recv', text: 'Combinado Marina! Já anotei tudo aqui: família de 4, Calgary 18/jul, 4 dias, primeira vez no Canadá, sem hospedagem definida' },
      { type: 'recv', text: 'O Joel vai te chamar hoje à noite. Boa noite, e bem-vinda à família TwoCanada 🇨🇦' },
    ],
    notificacao: {
      titulo: '🔥 LEAD QUENTE — Marina',
      corpo: 'Família 4 pessoas · Calgary 18/jul · 4 dias · primeira vez no Canadá · sem hotel · ticket CAD $4.800-6.200 · pediu seu retorno',
    },
  },
  {
    titulo: 'Surpresa de aniversário pra esposa',
    cliente_nome: 'Ricardo',
    hora_inicio: { h: 21, m: 14 },
    notif_hora: '21:22',
    mensagens: [
      { type: 'sent', text: 'Boa noite. Quero fazer uma surpresa pra minha esposa. Aniversário dela é 12 de setembro, vamos estar em Calgary' },
      { type: 'sent', text: 'Pensei em algo bem especial nas Rochosas. O que vocês podem fazer?' },
      { type: 'recv', text: 'Boa noite Ricardo! Que ideia linda. Surpresas de aniversário nas Rochosas são uma das nossas especialidades aqui na TwoCanada 💛' },
      { type: 'recv', text: 'Setembro é mágico: outono começando, lagos ainda azuis, picos com primeiro frio na neve. Cenário perfeito pra um dia inesquecível' },
      { type: 'recv', text: 'Antes de te montar a proposta, me conta um pouco:' },
      { type: 'recv', text: 'Vocês são casal sozinho ou tem mais gente na viagem? Tem alguma coisa que ela ama em particular (champagne, fotos, helicóptero, jantar romântico)? Qual o nome dela pra eu já personalizar tudo?' },
      { type: 'sent', text: 'Só nós dois. Ela é apaixonada por fotografia e nunca andou de helicóptero. Nome dela é Camila' },
      { type: 'recv', text: 'Ricardo, anota essa: temos um pacote que parece feito pra ela 🤍' },
      { type: 'recv', text: 'Recepção em Calgary com SUV premium e champagne, brunch no caminho pra Banff, gôndola até o topo de Sulphur Mountain, voo de helicóptero de 25 minutos sobre Banff e Lake Louise (vista que ela nunca esqueceu) e jantar romântico no fim do dia' },
      { type: 'recv', text: 'O Joel registra tudo com câmera profissional. No momento do pôr do sol, ele exibe uma mensagem sua surpresa pra Camila no painel do SUV. Já fizemos isso pra dezenas de casais e o resultado é sempre lágrima' },
      { type: 'recv', text: 'Ticket de referência CAD $5.800 pra esse dia completo, tudo incluso menos bebidas no jantar' },
      { type: 'recv', text: 'Quer que eu já reserve a data 12/set e o Joel te chame amanhã pra alinhar a mensagem surpresa e os detalhes?' },
      { type: 'sent', text: 'Sim, por favor! Pode reservar' },
      { type: 'recv', text: 'Reservado, Ricardo. Data 12/set bloqueada. Joel te chama amanhã. A Camila não vai esquecer essa nunca 💛' },
    ],
    notificacao: {
      titulo: '🔥 LEAD QUENTE — Ricardo',
      corpo: 'Surpresa aniversário esposa Camila · 12/set · pacote premium com heli · CAD $5.800 · DATA RESERVADA · pediu retorno amanhã',
    },
  },
  {
    titulo: 'Brasileiro recente perguntando sobre Waterton',
    cliente_nome: 'Felipe',
    hora_inicio: { h: 11, m: 48 },
    notif_hora: '11:54',
    mensagens: [
      { type: 'sent', text: 'Oi, cheguei no Canadá faz 6 meses, moro em Calgary. Tô vendo no Instagram de vocês o passeio pro Waterton' },
      { type: 'sent', text: 'Vale a pena? Pensei em ir agora em outubro' },
      { type: 'recv', text: 'Felipe, boas-vindas oficiais pelo Joel quando ele te conhecer pessoalmente! 🇧🇷🇨🇦 Sou a Alpha, te ajudo enquanto ele tá em campo' },
      { type: 'recv', text: 'Waterton é uma das experiências mais subestimadas do Canadá. Quem foi sempre volta. Pra brasileiro recente é especial porque é menos turístico que Banff (mais tranquilo, menos brasileiros conhecendo)' },
      { type: 'recv', text: 'Outubro é uma janela boa: cores de outono fortes, lago ainda navegável (depois fecha), e dá pra fazer o passeio de barco até a divisa com os Estados Unidos. Visualmente é um dos pontos mais bonitos do Canadá' },
      { type: 'recv', text: 'Como você já mora aqui, me conta:' },
      { type: 'recv', text: 'Vai sozinho, em casal ou em grupo? Carro próprio ou quer transporte? Tem data específica em mente em outubro?' },
      { type: 'sent', text: 'Vou com minha namorada. Não temos carro ainda. Pensamos no fim de semana 18-19 de outubro' },
      { type: 'recv', text: 'Combinação perfeita Felipe. Pacote Waterton de 1 dia com saída e retorno em Calgary, transporte privativo, almoço beira do lago, trilhas curtas, passeio de barco e fotos profissionais' },
      { type: 'recv', text: 'Pra casal recém-chegado a gente faz preço de morador (não é o preço de turista que vai voltar pro Brasil): CAD $890 o casal o dia inteiro' },
      { type: 'recv', text: 'Bônus: o Joel é brasileiro também e adora trocar ideia com quem chegou recente. Saiba que vai voltar pra casa com mais que fotos, vai voltar com indicações de tudo que precisa pra se virar em Calgary' },
      { type: 'recv', text: 'Quer que eu já reserve 18/out e o Joel te chame hoje à tarde?' },
      { type: 'sent', text: 'Cara, gostei muito! Pode reservar sim' },
      { type: 'recv', text: 'Reservado. 18/out bloqueado pra você e sua namorada. Joel te chama hoje. Bem-vindo de novo, agora pelo lado certo do Canadá 🍁' },
    ],
    notificacao: {
      titulo: '🔥 LEAD QUENTE — Felipe',
      corpo: 'Brasileiro recente Calgary · casal · Waterton 18/out · sem carro · CAD $890 · DATA RESERVADA · pediu retorno hoje',
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
    cliente: 'TwoCanada Experience',
    contato: 'Joel',
    tipo: 'turismo',
    cenarios,
    ativo: true,
    cores: {
      fundo: '#0D1B2A',
      primaria: '#2E5EAA',
      accent: '#C8973A',
    },
    mensagem_topo: 'Demonstração privada feita pra TwoCanada Experience. Cenários reais da operação do Joel: família planejando Banff, surpresa de aniversário com helicóptero, brasileiro recente perguntando sobre Waterton.',
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
