import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Splash() {
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)

  function abrirEnvelope() {
    if (aberto) return
    setAberto(true)
    setTimeout(() => {
      navigate("/convite")
    }, 1200)
  }

  return (
    <div className="splash-container">
      <div className={`envelope ${aberto ? 'aberto' : ''}`} onClick={abrirEnvelope}>
        <div className="envelope-corpo" />
        <div className="envelope-lado-esq" />
        <div className="envelope-lado-dir" />
        <div className="envelope-aba" />
        <div className="selo" />
      </div>
      <p className="splash-texto">{aberto ? 'Abrindo...' : 'Clique no envelope para abrir o convite'}</p>
    </div>
  )
}
