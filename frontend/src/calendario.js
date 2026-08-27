// Geração dos formatos de calendário do evento, a partir do bloco
// `calendario` do configuracaoTema.js.

// Converte "HH:MM DD/MM/AAAA" para AAAAMMDDTHHMMSS, que é tanto o formato
// do link do Google quanto o de data local do iCalendar.
function converterData(dataBR) {
  if (!dataBR) return ''
  const [horaMinuto, data] = dataBR.split(' ')
  const [hora, minuto] = horaMinuto.split(':')
  const [dia, mes, ano] = data.split('/')
  return `${ano}${mes}${dia}T${hora}${minuto}00`
}

export function criarUrlCalendario(tema) {
  const c = tema.calendario
  if (!c.dataInicio) return '#'
  const nomeCodificado = encodeURIComponent(c.eventoNome || tema.nomeBebe)
  const enderecoCodificado = encodeURIComponent(c.endereco)
  const dataInicio = converterData(c.dataInicio)
  const dataFim = c.dataFim ? converterData(c.dataFim) : dataInicio
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${nomeCodificado}&dates=${dataInicio}/${dataFim}&location=${enderecoCodificado}`
}

// No iCalendar, vírgula, ponto e vírgula e barra invertida são separadores:
// precisam de escape, senão um endereço com vírgula quebra a importação.
function escaparIcs(texto) {
  return String(texto || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// A RFC 5545 limita cada linha a 75 octetos; a continuação começa com espaço.
function dobrarLinha(linha) {
  if (linha.length <= 75) return linha
  const partes = [linha.slice(0, 75)]
  let resto = linha.slice(75)
  while (resto.length > 74) {
    partes.push(' ' + resto.slice(0, 74))
    resto = resto.slice(74)
  }
  if (resto) partes.push(' ' + resto)
  return partes.join('\r\n')
}

function carimboUtc() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Arquivo .ics (iCalendar). Formato universal — iPhone, Android, Outlook —
// e não depende de agenda sincronizada no aparelho, que é justamente o que
// trava o link do Google Agenda em alguns celulares.
export function criarArquivoIcs(tema) {
  const c = tema.calendario
  if (!c.dataInicio) return ''

  const inicio = converterData(c.dataInicio)
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//convite//cha-de-fraldas//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${inicio}-cha-de-fraldas@convite`,
    `DTSTAMP:${carimboUtc()}`,
    `DTSTART:${inicio}`,
  ]

  // Sem dataFim o DTEND é omitido de propósito: pela RFC, um evento com
  // DTSTART e sem DTEND "não ocupa tempo". É mais correto do que repetir o
  // DTSTART, que alguns aplicativos recusam.
  if (c.dataFim) linhas.push(`DTEND:${converterData(c.dataFim)}`)

  linhas.push(`SUMMARY:${escaparIcs(c.eventoNome || tema.nomeBebe)}`)
  if (c.endereco) linhas.push(`LOCATION:${escaparIcs(c.endereco)}`)
  if (tema.mensagemConvite) {
    linhas.push(`DESCRIPTION:${escaparIcs(tema.mensagemConvite)}`)
  }
  linhas.push('END:VEVENT', 'END:VCALENDAR')

  return linhas.map(dobrarLinha).join('\r\n') + '\r\n'
}

// Monta o .ics na hora e dispara o download. Fica aqui para o Invite.jsx
// não precisar lidar com Blob/URL de objeto.
export function baixarIcs(tema, nomeArquivo = 'convite.ics') {
  const conteudo = criarArquivoIcs(tema)
  if (!conteudo) return false

  const blob = new Blob([conteudo], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
