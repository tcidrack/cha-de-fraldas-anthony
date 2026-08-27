import { useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"
import { tema, criarUrlCalendario } from "../configuracaoTema"
import { IconePin, IconeCheck, IconePresente } from "../componentes/Icones"

const urlMaps = tema.calendario.mapsUrl
const urlCalendario = criarUrlCalendario(tema)
const TABELA_VAGAS = tema.tabelaVagas
const CHAVE_LOCAL = "confirmado_cha_fraldas"

// Mensagens das exceções levantadas pela função confirmar_presenca no banco.
const ERROS = {
  NOME_VAZIO: ["error", "Digite seu nome 💖"],
  NOME_DUPLICADO: ["error", "Já há confirmação para este nome"],
  TAMANHO_OBRIGATORIO: ["error", "Escolha um tamanho de fralda"],
  TAMANHO_ESGOTADO: ["error", "Esse tamanho acabou de esgotar — escolha outro"],
}

function lerErro(mensagem) {
  const chave = Object.keys(ERROS).find((k) => (mensagem || "").includes(k))
  return chave ? { chave, toast: ERROS[chave] } : null
}

export default function Invite() {
  const [nome, setNome] = useState("")
  const [tamanho, setTamanho] = useState("")
  const [vagas, setVagas] = useState(null) // null = ainda nao carregou
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [toast, setToast] = useState(null)
  const [jaConfirmado, setJaConfirmado] = useState(
    () => localStorage.getItem(CHAVE_LOCAL) !== null
  )

  const tudoEsgotado = vagas !== null && vagas.every((v) => v.restam === 0)

  const carregarVagas = useCallback(async () => {
    if (!supabase) {
      // Sem Supabase configurado: mostra os tamanhos padrão, todos livres.
      setVagas(tema.fraldas.tamanhosPadrao.map((t) => ({ tamanho: t, restam: null })))
      return
    }
    const { data, error } = await supabase
      .from(TABELA_VAGAS)
      .select("tamanho, limite, usadas, ordem")
      .order("ordem")

    if (error || !data) {
      console.error("Erro ao carregar vagas:", error)
      setVagas(tema.fraldas.tamanhosPadrao.map((t) => ({ tamanho: t, restam: null })))
      return
    }
    setVagas(
      data.map((v) => ({ tamanho: v.tamanho, restam: Math.max(v.limite - v.usadas, 0) }))
    )
  }, [])

  function abrirConfirmacao() {
    setMostrarConfirmacao(true)
    setTamanho("")
    setVagas(null)
    carregarVagas()
  }

  function salvarLocalmente(nomeConfirmado, tamanhoEscolhido) {
    try {
      const listaAtual = JSON.parse(localStorage.getItem("confirmacoes") || "[]")
      const atualizado = [
        ...listaAtual,
        {
          id: Date.now(),
          nome: nomeConfirmado,
          tamanho_fralda: tamanhoEscolhido || null,
          createdAt: new Date().toISOString(),
        },
      ]
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
    setTamanho("")
    setMostrarConfirmacao(false)
    try {
      window.open(urlCalendario, "_blank")
    } catch (e) {
      console.info("Não foi possível abrir calendário:", e)
    }
  }

  async function confirmar() {
    const nomeTrim = nome.trim()
    if (!nomeTrim) {
      showToast("error", "Digite seu nome 💖")
      return
    }
    if (!tamanho && !tudoEsgotado) {
      showToast("error", "Escolha um tamanho de fralda")
      return
    }

    setConfirmando(true)
    try {
      if (!supabase) {
        salvarLocalmente(nomeTrim, tamanho)
        finalizarConfirmacao(nomeTrim)
        showToast("success", "Presença confirmada!")
        return
      }

      // A reserva da vaga e a inserção acontecem juntas dentro da função,
      // numa transação só — é o que impede dois convidados simultâneos de
      // pegarem a mesma última vaga.
      const { error } = await supabase.rpc("confirmar_presenca", {
        p_nome: nomeTrim,
        p_tamanho: tamanho || null,
      })

      if (error) {
        const conhecido = lerErro(error.message)
        if (conhecido) {
          showToast(...conhecido.toast)
          if (conhecido.chave === "TAMANHO_ESGOTADO") {
            setTamanho("")
            carregarVagas()
          }
          return
        }
        console.error("Erro ao confirmar presença:", error)
        salvarLocalmente(nomeTrim, tamanho)
        showToast("info", "Não foi possível salvar no servidor — salvo localmente 👍")
        setNome("")
        setMostrarConfirmacao(false)
        return
      }

      finalizarConfirmacao(nomeTrim)
      showToast("success", "Presença confirmada!")
    } catch (error) {
      console.error("Erro ao confirmar presença:", error)
      salvarLocalmente(nomeTrim, tamanho)
      showToast("info", "Erro inesperado — salvo localmente")
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
            <button type="button" className="acao-confirmar" onClick={abrirConfirmacao}>
              <IconeCheck />
              <span>Confirmar presença</span>
            </button>
          )}

          <Link to="/mimos" className="acao-mimos">
            <IconePresente />
            <span>{tema.mimos.textoBotao}</span>
          </Link>

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

            <div className="fraldas">
              <p className="fraldas-pergunta">{tema.fraldas.pergunta}</p>

              {vagas === null && <p className="fraldas-ajuda">Carregando tamanhos...</p>}

              {vagas !== null && tudoEsgotado && (
                <p className="fraldas-aviso">{tema.fraldas.esgotadoTudo}</p>
              )}

              {vagas !== null && !tudoEsgotado && (
                <>
                  <div className="fraldas-opcoes">
                    {vagas.map((v) => {
                      const esgotado = v.restam === 0
                      return (
                        <button
                          key={v.tamanho}
                          type="button"
                          disabled={esgotado}
                          onClick={() => setTamanho(v.tamanho)}
                          className={
                            "fralda-chip" +
                            (tamanho === v.tamanho ? " selecionado" : "") +
                            (esgotado ? " esgotado" : "")
                          }
                        >
                          <span className="fralda-tamanho">{v.tamanho}</span>
                          <span className="fralda-restam">
                            {esgotado
                              ? "esgotado"
                              : v.restam === null
                                ? ""
                                : `restam ${v.restam}`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="fraldas-ajuda">{tema.fraldas.ajuda}</p>
                </>
              )}
            </div>

            <button
              className="btn-confirmar"
              onClick={confirmar}
              disabled={confirmando || vagas === null || (!tamanho && !tudoEsgotado)}
            >
              {confirmando ? "Confirmando..." : "Confirmar presença"}
            </button>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.text}</div>}
    </div>
  )
}
