-- ============================================================
--  Convite Chá de Fraldas do Anthony
--  Tabela de confirmações de presença — SQL Editor do Supabase
-- ============================================================

-- O nome da tabela também está em frontend/src/configuracaoTema.js
-- (campo `tabelaConfirmacoes`). Se mudar aqui, mude lá também.


-- ── 1. Tabela ─────────────────────────────────────────────────
-- (já criada em 2026-08-26; está aqui só como registro do schema)

CREATE TABLE public.confirmacoes_cha_anthony (
  id         BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome       TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT confirmacoes_cha_anthony_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;


-- ── 2. RLS ────────────────────────────────────────────────────
-- ESTE BLOCO AINDA PRECISA SER EXECUTADO.
--
-- A anon key fica visível no bundle do site publicado, então sem RLS
-- qualquer pessoa consegue apagar ou alterar as confirmações.
--
-- O app só precisa de duas operações:
--   insert -> o convidado confirmando presença
--   select -> a lista em /admin e a checagem de nome repetido
-- Sem policy de update/delete, ninguém apaga nem edita pela anon key.

ALTER TABLE public.confirmacoes_cha_anthony ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_publico" ON public.confirmacoes_cha_anthony
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "select_publico" ON public.confirmacoes_cha_anthony
  FOR SELECT TO anon USING (true);


-- ── Nota ──────────────────────────────────────────────────────
-- De propósito não há UNIQUE (nome). A checagem de nome repetido é
-- feita em código, no confirmar() do Invite.jsx, que mostra a mensagem
-- "Já há confirmação para este nome". Uma constraint no banco faria o
-- insert falhar e cair no ramo genérico "salvo localmente", que é uma
-- mensagem pior para o convidado.
