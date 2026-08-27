// Icones em SVG inline: evitam depender de uma fonte de icones externa,
// que quando nao carrega aparece como texto cru na tela.
//
// Os solidos levam a classe `icone-solido`, que o CSS pinta com
// currentColor. Os de contorno ficam sem ela, para o fill="none" do
// proprio SVG valer.

export function IconePin() {
  return (
    <svg className="icone icone-solido" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

export function IconeCheck({ preenchido = false }) {
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

export function IconePresente() {
  return (
    <svg className="icone icone-solido" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7h-2.2a3 3 0 0 0-.5-3.6 3 3 0 0 0-4.2 0L12 4.5l-1.1-1.1a3 3 0 0 0-4.2 0A3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3h8V7h2v4h8V8a1 1 0 0 0-1-1zM8.3 4.7a1 1 0 0 1 1.4 0L10.9 6H8.9a1 1 0 0 1-.6-1.3zm7.4 0a1 1 0 0 1 0 1.2A1 1 0 0 1 15.1 6h-2l1.2-1.3a1 1 0 0 1 1.4 0zM4 13v7a1 1 0 0 0 1 1h6v-8H4zm9 8h6a1 1 0 0 0 1-1v-7h-7v8z" />
    </svg>
  )
}

// --- icones da lista de mimos ---

const mimos = {
  lencos: (
    <path d="M4 8h16a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1zm2-3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1H6V5zm2.5 7a1 1 0 0 0 0 2h7a1 1 0 0 0 0-2h-7z" />
  ),
  pomada: (
    <path d="M10 2h4a1 1 0 0 1 1 1v2h-6V3a1 1 0 0 1 1-1zM8.6 7h6.8a2 2 0 0 1 2 2.2l-1 10A2 2 0 0 1 14.4 21H9.6a2 2 0 0 1-2-1.8l-1-10A2 2 0 0 1 8.6 7zM11 10v2H9v2h2v2h2v-2h2v-2h-2v-2h-2z" />
  ),
  roupinha: (
    <path d="M9 3h6a1 1 0 0 1 .9.6l3.5 3.6a1 1 0 0 1 0 1.4l-2 2a1 1 0 0 1-1.4 0L15 9.6V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V9.6l-1 1a1 1 0 0 1-1.4 0l-2-2a1 1 0 0 1 0-1.4l3.5-3.6A1 1 0 0 1 9 3zm1.4 1.6a1.7 1.7 0 0 0 3.2 0h-3.2z" />
  ),
  banho: (
    <path d="M12 2a3 3 0 0 0-3 3v1h2V5a1 1 0 0 1 2 0v6h-2v2h2a2 2 0 0 1 2 2v1h2v-1a4 4 0 0 0-3-3.9V5a3 3 0 0 0-2-3zM4 15h16a1 1 0 0 1 1 1 5 5 0 0 1-3 4.6V22h-2v-1H8v1H6v-1.4A5 5 0 0 1 3 16a1 1 0 0 1 1-1z" />
  ),
  brinquedo: (
    <path d="M12 2a5 5 0 0 1 5 5c0 1.9-1 3.5-2.6 4.4l.4 1.3A3 3 0 1 1 13 15.9L12.6 14a5.6 5.6 0 0 1-1.2 0L11 15.9a3 3 0 1 1-1.8-3.2l.4-1.3A5 5 0 0 1 12 2zm0 2.5A2.5 2.5 0 1 0 12 9.5a2.5 2.5 0 0 0 0-5zM8.5 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
  ),
  coracao: (
    <path d="M12 20.7 4.6 13.3a4.7 4.7 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l.8.8.8-.8a4.7 4.7 0 0 1 6.6 6.6L12 20.7z" />
  ),
}

export function IconeMimo({ nome }) {
  const desenho = mimos[nome] || mimos.coracao
  return (
    <svg className="icone icone-solido" viewBox="0 0 24 24" aria-hidden="true">
      {desenho}
    </svg>
  )
}
