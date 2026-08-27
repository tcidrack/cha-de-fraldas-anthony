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
  nomeBebe: 'Cidrack Dev',

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

  // << EDITE AQUI >> bloco de sugestoes de presente
  sugestoesPresente: {
    titulo: 'Sugestões de presente',
    texto: 'Fraldas P, M e G',
  },

  // << EDITE AQUI >> despedida no rodape do convite
  mensagemFinal: 'Espero por você!',

  recursos: {
    fundo: '/assets/fundo-de-tela.jpg',
    urso: '/assets/urso-baby.png',
    fita: '/assets/fita.png',
    selo: '/assets/flor.png',
  },

  calendario: {
    // << EDITE AQUI >> endereco, link do maps e horarios
    endereco: 'R. Dídimo Cidrack - Novo Maranguape I',
    mapsUrl: 'https://maps.app.goo.gl/1R6zk1j6S6UA2NGA7',
    eventoNome: 'Chá de Fraldas do Anthony',
    dataInicio: '16:00 06/07/2026', // formato HH:MM DD/MM/AAAA
    dataFim: '', // opcional; vazio usa o mesmo horario de inicio
  },

  // Tabela do Supabase que guarda as confirmacoes de presenca
  tabelaConfirmacoes: 'confirmacoes_cha_anthony',
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
