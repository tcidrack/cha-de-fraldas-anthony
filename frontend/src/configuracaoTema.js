// =====================================================================
//  EDITE AQUI  -  todos os dados do convite ficam neste arquivo.
//  Nao e preciso mexer em mais nenhum outro lugar.
// =====================================================================

export const tema = {
  id: 'chaDeFraldas',
  tipo: 'cha-de-fraldas',
  titulo: 'Convite de Cha de Fraldas',

  // Texto que aparece dentro da fita, no topo do convite
  tituloFita: 'Chá de Fraldas',

  // << EDITE AQUI >> nome do bebe (fonte cursiva grande)
  nomeBebe: 'Cidrack',

  // << EDITE AQUI >> mensagem do convite
  mensagemConvite:
    'Mamãe está muito feliz com a minha chegada e quer compartilhar esse lindo momento com você!',

  // << EDITE AQUI >> data e hora do evento
  dataEvento: {
    dia: '30',
    mes: 'Agosto',
    ano: '2026',
    hora: '16',
    minuto: '00',
  },

  // << EDITE AQUI >> despedida no rodape do convite
  mensagemFinal: 'Espero por você!',

  // Pagina /mimos, aberta pelo botao "Sugestoes de mimos"
  mimos: {
    textoBotao: 'Sugestões de mimos',
    titulo: 'Sugestões de mimos',
    subtitulo: 'Sugestão de mimo além das fraldas, aqui vão algumas ideias:',
    voltar: 'Voltar para o convite',
    // << EDITE AQUI >> itens da lista (icone: lencos | pomada | roupinha | banho | brinquedo | coracao)
    lista: [
      { id: 1, icone: 'lencos',    texto: 'Lenços umedecidos' },
      { id: 2, icone: 'pomada',    texto: 'Pomada para assaduras' },
      { id: 3, icone: 'roupinha',  texto: 'Roupinhas de 0 a 3 meses' },
      { id: 4, icone: 'banho',     texto: 'Sabonete e shampoo infantil' },
      { id: 5, icone: 'brinquedo', texto: 'Mordedor ou chocalho' },
      { id: 6, icone: 'coracao',   texto: 'Ou o mimo que o seu coração mandar' },
    ],

    // Chave Pix, para quem preferir mandar um valor.
    // A secao so aparece no site quando `chave` estiver preenchida —
    // vazio mantem o bloco oculto.
    pix: {
      // << EDITE AQUI >> chave e nome de quem recebe
      chave: '11111111111',
      tipo: 'CPF',        // rotulo ao lado da chave: CPF, Telefone, E-mail...
      recebedor: 'Cidrack Dev',      // nome do recebedor, para o convidado conferir
      titulo: 'Prefere mandar um mimo em dinheiro?',
      descricao: 'Toda ajuda é bem-vinda! Se preferir, envie pelo Pix:',
      textoCopiar: 'Copiar chave',
      textoCopiado: 'Chave copiada!',
    },
  },

  // Textos do seletor de tamanho no modal de confirmacao
  fraldas: {
    pergunta: 'Qual tamanho de fralda você vai levar?',
    ajuda: 'Cada tamanho tem uma quantidade limitada, para não faltar nem sobrar.',
    esgotadoTudo: 'As fraldas já foram todas reservadas! Você ainda pode confirmar sua presença.',
    // Usado so como reserva, se a leitura das vagas no banco falhar.
    // A fonte de verdade e a tabela `vagas_fralda`.
    tamanhosPadrao: ['P', 'M', 'G'],
  },

  recursos: {
    fundo: '/assets/fundo-de-tela.jpg',
    urso: '/assets/urso-baby.png',
    fita: '/assets/fita.png',
    selo: '/assets/flor.png',
  },

  calendario: {
    // << EDITE AQUI >> endereco, link do maps e horarios
    endereco: 'R. Dídimo Cidrack - Novo Maranguape I',
    mapsUrl: 'https://maps.app.goo.gl/vZKjEXMyEUNUEiUJ9',
    eventoNome: 'Chá de Fraldas do Cidrack',
    dataInicio: '16:00 30/08/2026', // formato HH:MM DD/MM/AAAA
    dataFim: '', // opcional; vazio usa o mesmo horario de inicio
  },

  // Tabelas do Supabase
  tabelaConfirmacoes: 'confirmacoes_cha_anthony',
  tabelaVagas: 'vagas_fralda',
}
