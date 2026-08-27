import { Link } from "react-router-dom"
import { tema } from "../configuracaoTema"
import { IconeMimo } from "../componentes/Icones"

export default function Mimos() {
  const itens = tema.mimos.lista || []

  return (
    <div className="pagina-convite">
      <div className="convite-card">
        <div className="mimos">
          <h1 className="mimos-titulo">{tema.mimos.titulo}</h1>
          <p className="mimos-subtitulo">{tema.mimos.subtitulo}</p>

          <ul className="mimos-lista">
            {itens.map((item) => (
              <li key={item.id} className="mimo">
                <IconeMimo nome={item.icone} />
                <span>{item.texto}</span>
              </li>
            ))}
          </ul>

          <Link to="/convite" className="mimos-voltar">
            ← {tema.mimos.voltar}
          </Link>
        </div>
      </div>
    </div>
  )
}
