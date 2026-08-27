import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import { tema } from "../configuracaoTema"

const TABELA = tema.tabelaConfirmacoes

export default function Admin() {
  const [confirmados, setConfirmados] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarConfirmados() {
      if (!supabase) {
        setErro('Supabase não configurado — preencha o arquivo .env')
        return
      }
      try {
        const { data, error } = await supabase
          .from(TABELA)
          .select('*')

        if (error) {
          console.error('Erro ao carregar confirmados:', error)
          setErro('Erro: ' + error.message)
          return
        }

        setErro(null)
        setConfirmados(data || [])
      } catch (error) {
        console.error('Erro ao carregar confirmados:', error)
        setErro('Erro inesperado ao carregar lista')
      }
    }

    carregarConfirmados()

    const intervalo = setInterval(() => {
      carregarConfirmados()
    }, 30000)

    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1>Lista de Confirmados</h1>

        {erro && <p className="admin-erro">{erro}</p>}

        {!erro && confirmados.length === 0 && (
          <p className="admin-vazio">Nenhum convidado confirmado ainda.</p>
        )}

        <ul>
          {confirmados.map(c => (
            <li key={c.id}>{c.nome}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
