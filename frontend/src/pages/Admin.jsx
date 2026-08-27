import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { tema } from "../configuracaoTema"

const TABELA = tema.tabelaConfirmacoes
const TABELA_VAGAS = tema.tabelaVagas

export default function Admin() {
  const [confirmados, setConfirmados] = useState([])
  const [vagas, setVagas] = useState([])
  const [erro, setErro] = useState(null)

  // editor de cotas
  const [limites, setLimites] = useState({})
  const [senha, setSenha] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    async function carregar() {
      if (!supabase) {
        setErro("Supabase não configurado — preencha o arquivo .env")
        return
      }
      try {
        const [conf, vag] = await Promise.all([
          supabase.from(TABELA).select("*").order("created_at"),
          supabase.from(TABELA_VAGAS).select("tamanho, limite, usadas, ordem").order("ordem"),
        ])

        if (conf.error) {
          console.error("Erro ao carregar confirmados:", conf.error)
          setErro("Erro: " + conf.error.message)
          return
        }
        setErro(null)
        setConfirmados(conf.data || [])

        if (!vag.error && vag.data) {
          setVagas(vag.data)
          setLimites(Object.fromEntries(vag.data.map((v) => [v.tamanho, String(v.limite)])))
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setErro("Erro inesperado ao carregar lista")
      }
    }

    carregar()
    const intervalo = setInterval(carregar, 30000)
    return () => clearInterval(intervalo)
  }, [])

  async function salvarLimites() {
    if (!senha) {
      setAviso({ tipo: "erro", texto: "Digite a senha" })
      return
    }
    setSalvando(true)
    setAviso(null)
    try {
      // A senha é conferida dentro da função no banco, não aqui —
      // qualquer checagem em JavaScript seria contornável.
      const payload = Object.fromEntries(
        Object.entries(limites).map(([t, v]) => [t, Number(v) || 0])
      )
      const { data, error } = await supabase.rpc("atualizar_vagas", {
        p_senha: senha,
        p_limites: payload,
      })

      if (error) {
        if ((error.message || "").includes("SENHA_INVALIDA")) {
          setAviso({ tipo: "erro", texto: "Senha incorreta" })
        } else {
          console.error("Erro ao atualizar vagas:", error)
          setAviso({ tipo: "erro", texto: "Erro ao salvar: " + error.message })
        }
        return
      }

      if (data) {
        setVagas(data)
        setLimites(Object.fromEntries(data.map((v) => [v.tamanho, String(v.limite)])))
      }
      setSenha("")
      setAviso({ tipo: "ok", texto: "Quantidades atualizadas!" })
    } catch (error) {
      console.error("Erro ao atualizar vagas:", error)
      setAviso({ tipo: "erro", texto: "Erro inesperado ao salvar" })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1>Lista de Confirmados</h1>

        {erro && <p className="admin-erro">{erro}</p>}

        {!erro && vagas.length > 0 && (
          <div className="admin-resumo">
            {vagas.map((v) => (
              <div key={v.tamanho} className="admin-resumo-item">
                <span className="admin-resumo-tamanho">{v.tamanho}</span>
                <span className="admin-resumo-num">
                  {v.usadas}/{v.limite}
                </span>
              </div>
            ))}
          </div>
        )}

        {!erro && confirmados.length === 0 && (
          <p className="admin-vazio">Nenhum convidado confirmado ainda.</p>
        )}

        <ul>
          {confirmados.map((c) => (
            <li key={c.id}>
              <span>{c.nome}</span>
              <span className="admin-tag">{c.tamanho_fralda || "sem fralda"}</span>
            </li>
          ))}
        </ul>

        {!erro && vagas.length > 0 && (
          <div className="admin-cotas">
            <h2>Quantidade de cada tamanho</h2>
            <div className="admin-cotas-campos">
              {vagas.map((v) => (
                <label key={v.tamanho} className="admin-cota">
                  <span>{v.tamanho}</span>
                  <input
                    type="number"
                    min="0"
                    value={limites[v.tamanho] ?? ""}
                    onChange={(e) =>
                      setLimites({ ...limites, [v.tamanho]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button onClick={salvarLimites} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar quantidades"}
            </button>
            {aviso && (
              <p className={aviso.tipo === "ok" ? "admin-ok" : "admin-erro"}>{aviso.texto}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
