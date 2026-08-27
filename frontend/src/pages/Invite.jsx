import { useState } from "react"
import { supabase } from "../services/supabase"
import { tema, criarUrlCalendario } from "../configuracaoTema"

const urlMaps = tema.calendario.mapsUrl
const urlCalendario = criarUrlCalendario(tema)
const TABELA = tema.tabelaConfirmacoes
const CHAVE_LOCAL = "confirmado_cha_fraldas"

// Icones em SVG inline: evitam depender de uma fonte de icones externa,
// que quando nao carrega aparece como texto cru ("location_on") na tela.
function IconePin() {
  return (
    <svg className="icone icone-solido" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

function IconeCheck({ preenchido = false }) {
  return preenchido ? (
    <svg className="icone icone-solido" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.6-4.2-4.2 1.4-1.4 2.8 2.8 5.2-5.2 1.4 1.4-6.6 6.6z" />
    </svg>
  ) : (
    <svg className="icone" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.7 2.7L16 9.7" />
    </svg>
  )
}

export default function Invite() {
  const [nome, setNome] = useState("")
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [toast, setToast] = useState(null)
  const [jaConfirmado, setJaConfirmado] = useState(
    () => localStorage.getItem(CHAVE_LOCAL) !== null
  )

  function salvarLocalmente(nomeConfirmado) {
    try {
      const listaAtual = JSON.parse(localStorage.getItem("confirmacoes") || "[]")
      const atualizado = [...listaAtual, { id: Date.now(), nome: nomeConfirmado, createdAt: new Date().toISOString() }]
      localStorage.setItem("confirmacoes", JSON.stringify(atualizado))
    } catch (err) {
      console.error("Erro ao salvar localmente:", err)
    }
  }

  function showToast(type, text, ms = 3000) {
    setToast({ type, text })
    setTimeout(() => setToast(null), ms)
  }

  function finalizarConfirmacao(nomeConfirmado) {
    localStorage.setItem(CHAVE_LOCAL, nomeConfirmado)
    setJaConfirmado(true)
    setNome("")
    setMostrarConfirmacao(false)
    try {
      window.open(urlCalendario, '_blank')
    } catch (e) {
      console.info('Não foi possível abrir calendário:', e)
    }
  }

  async function confirmar() {
    const nomeTrim = nome.trim()
    if (!nomeTrim) {
      showToast("error", "Digite seu nome 💖")
      return
    }
    setConfirmando(true)
    try {
      if (!supabase) {
        salvarLocalmente(nomeTrim)
        finalizarConfirmacao(nomeTrim)
        showToast("success", "Presença confirmada!")
        return
      }

      const { data: existentes, error: erroConsulta } = await supabase
        .from(TABELA)
        .select('nome')
        .eq('nome', nomeTrim)

      if (erroConsulta) {
        console.error('Erro ao consultar confirmações:', erroConsulta)
        salvarLocalmente(nomeTrim)
        showToast('info', 'Problema ao validar confirmação — salvo localmente')
        setNome('')
        setMostrarConfirmacao(false)
        return
      }

      if (existentes && existentes.length > 0) {
        showToast('error', 'Já há confirmação para este nome')
        setNome('')
        setMostrarConfirmacao(false)
        return
      }

      const { error: erroInsercao } = await supabase.from(TABELA).insert({
        nome: nomeTrim
      })

      if (erroInsercao) {
        console.error('Erro ao salvar confirmação:', erroInsercao)
        salvarLocalmente(nomeTrim)
        showToast('info', 'Não foi possível salvar no servidor — salvo localmente 👍')
      } else {
        finalizarConfirmacao(nomeTrim)
        showToast('success', 'Presença confirmada!')
      }
    } catch (error) {
      console.error('Erro ao confirmar presença:', error)
      salvarLocalmente(nomeTrim)
      showToast('info', 'Erro inesperado — salvo localmente')
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="pagina-convite">
      <div className="convite-card">
        <img src={tema.recursos.urso} alt="" className="urso" />

        <div className="convite-conteudo">
          <div className="fita">
            <span className="fita-texto">{tema.tituloFita}</span>
          </div>

          <h1 className="nome-bebe">{tema.nomeBebe}</h1>

          <p className="mensagem">{tema.mensagemConvite}</p>

          <div className="selos">
            <div className="selo-data">
              <span className="selo-numero">{tema.dataEvento.dia}</span>
              <span className="selo-texto">{tema.dataEvento.mes}</span>
            </div>
            <div className="selo-data">
              <span className="selo-numero">{tema.dataEvento.hora}h</span>
            </div>
          </div>

          <a href={urlMaps} target="_blank" rel="noreferrer" className="local">
            <IconePin />
            <span className="local-texto">{tema.calendario.endereco}</span>
          </a>

          {jaConfirmado ? (
            <div className="acao-confirmar confirmado">
              <IconeCheck preenchido />
              <span>Presença confirmada!</span>
            </div>
          ) : (
            <button type="button" className="acao-confirmar" onClick={() => setMostrarConfirmacao(true)}>
              <IconeCheck />
              <span>Confirmar presença</span>
            </button>
          )}

          <div className="presentes-inline">
            <span className="presentes-titulo">{tema.sugestoesPresente.titulo}</span>
            <p className="presentes-texto">{tema.sugestoesPresente.texto}</p>
          </div>

          <p className="mensagem-final">{tema.mensagemFinal}</p>
        </div>
      </div>

      {mostrarConfirmacao && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-modal" onClick={() => setMostrarConfirmacao(false)}>
              ✖
            </button>
            <h2>Confirme sua presença</h2>
            <p>Digite seu nome e sobrenome ou da sua família para aparecer na lista de convidados confirmados.</p>
            <input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <button className="btn-confirmar" onClick={confirmar} disabled={confirmando}>
              {confirmando ? "Confirmando..." : "Confirmar presença"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.text}</div>
      )}
    </div>
  )
}
