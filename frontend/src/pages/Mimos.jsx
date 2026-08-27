import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { tema } from "../configuracaoTema"
import { IconeMimo, IconePix } from "../componentes/Icones"

const pix = tema.mimos.pix || {}

// O convite roda em celular de todo tipo, então a cópia tem três níveis:
// a API moderna, o fallback com textarea e, em último caso, selecionar o
// texto na tela para a pessoa copiar na mão.
async function copiar(texto, elementoChave) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch (e) {
    console.info("Clipboard API indisponível, tentando fallback:", e)
  }

  try {
    const area = document.createElement("textarea")
    area.value = texto
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(area)
    if (ok) return true
  } catch (e) {
    console.info("Fallback de cópia falhou:", e)
  }

  // Último recurso: deixa a chave selecionada para cópia manual.
  try {
    if (elementoChave) {
      const range = document.createRange()
      range.selectNodeContents(elementoChave)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  } catch (e) {
    console.info("Não foi possível selecionar a chave:", e)
  }
  return false
}

export default function Mimos() {
  const itens = tema.mimos.lista || []
  const [copiado, setCopiado] = useState(false)
  const chaveRef = useRef(null)

  async function aoCopiar() {
    const ok = await copiar(pix.chave, chaveRef.current)
    if (!ok) return // só confirma se a cópia realmente aconteceu
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

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

          {/* Só aparece depois que a chave for preenchida em configuracaoTema.js */}
          {pix.chave && (
            <div className="pix">
              <div className="pix-cabecalho">
                <IconePix />
                <h2 className="pix-titulo">{pix.titulo}</h2>
              </div>
              <p className="pix-descricao">{pix.descricao}</p>

              <div className="pix-caixa">
                {pix.tipo && <span className="pix-tipo">{pix.tipo}</span>}
                <span className="pix-chave" ref={chaveRef}>
                  {pix.chave}
                </span>
              </div>

              {pix.recebedor && <p className="pix-recebedor">{pix.recebedor}</p>}

              <button type="button" className="pix-copiar" onClick={aoCopiar}>
                {copiado ? pix.textoCopiado : pix.textoCopiar}
              </button>
            </div>
          )}

          <Link to="/convite" className="mimos-voltar">
            ← {tema.mimos.voltar}
          </Link>
        </div>
      </div>
    </div>
  )
}
