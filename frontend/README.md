# Convite — Chá de Fraldas

Convite digital em Vite + React, no mesmo padrão do `convite-joao-miguel`.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Rotas

| Rota | O que é |
|---|---|
| `/` | Splash com o envelope; ao clicar, abre o convite |
| `/convite` | O convite |
| `/admin` | Lista de quem confirmou presença |

## Editar os dados do evento

Tudo fica em **`src/configuracaoTema.js`**, nos pontos marcados com `<< EDITE AQUI >>`:
nome do bebê, data, hora, endereço, link do maps, mensagem e sugestões de presente.

Não é preciso mexer em nenhum outro arquivo.

## Confirmação de presença (Supabase)

Sem configurar nada, o convite já funciona: as confirmações ficam salvas no
`localStorage` do navegador de cada convidado. Para ter a lista centralizada
em `/admin`, preencha o `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

(dá para reaproveitar as mesmas credenciais do projeto `convite-joao-miguel`)

E crie a tabela no Supabase rodando o **`database.sql`** que está na raiz do projeto
(um nível acima desta pasta) no SQL Editor.

O nome da tabela também está em `src/configuracaoTema.js` (`tabelaConfirmacoes`).

## Imagens

Ficam em `public/assets/`. Os caminhos estão em `src/configuracaoTema.js`
(`recursos`) e no `src/index.css`:

- `fundo-de-tela.jpg` — fundo de nuvens
- `urso-baby.png` — urso com balões, no canto esquerdo
- `fita.png` — faixa do título
- `flor.png` — selos de data e hora
