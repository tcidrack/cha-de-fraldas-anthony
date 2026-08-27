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
  nomeBebe: 'Anthony',

  // << EDITE AQUI >> mensagem do convite
  mensagemConvite:
    'Mamãe está muito feliz com a minha chegada e quer compartilhar esse lindo momento com você!',

  // << EDITE AQUI >> data e hora do evento
  dataEvento: {
    dia: '06',
    mes: 'Julho',
    ano: '2026',
    hora: '16',
    minuto: '00',
  },

  // << EDITE AQUI >> bloco de sugestoes de presente
  sugestoesPresente: {
    titulo: 'Sugestões de presente',
    texto: 'Fraldas P, M e G e Mimo',
  },

  // << EDITE AQUI >> despedida no rodape do convite
  mensagemFinal: 'Espero por você!',

  // Pagina /mimos, aberta pelo botao "Sugestoes de mimos"
  mimos: {
    textoBotao: 'Sugestões de mimos',
    titulo: 'Sugestões de mimos',
    subtitulo: 'Se quiser trazer um mimo além das fraldas, aqui vão algumas ideias:',
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
    endereco: 'Loteamento Belas Artes, bairro Mosquito - Agronômica',
    mapsUrl: 'https://maps.google.com/?q=Loteamento+Belas+Artes',
    eventoNome: 'Chá de Fraldas do Anthony',
    dataInicio: '16:00 06/07/2026', // formato HH:MM DD/MM/AAAA
    dataFim: '', // opcional; vazio usa o mesmo horario de inicio
  },

  // Tabelas do Supabase
  tabelaConfirmacoes: 'confirmacoes_cha_anthony',
  tabelaVagas: 'vagas_fralda',
}

function converterDataGoogle(dataBR) {
  if (!dataBR) return '';
  const [horaMinuto, data] = dataBR.split(' ');
  const [hora, minuto] = horaMinuto.split(':');
  const [dia, mes, ano] = data.split('/');
  return `${ano}${mes}${dia}T${hora}${minuto}00`;
}

export function criarUrlCalendario(tema) {
  if (!tema.calendario.dataInicio) return '#';
  const nomeCodificado = encodeURIComponent(tema.calendario.eventoNome || tema.nomeBebe);
  const enderecoCodificado = encodeURIComponent(tema.calendario.endereco);
  const dataInicio = converterDataGoogle(tema.calendario.dataInicio);
  const dataFim = tema.calendario.dataFim ? converterDataGoogle(tema.calendario.dataFim) : dataInicio;
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${nomeCodificado}&dates=${dataInicio}/${dataFim}&location=${enderecoCodificado}`;
}
