-- ============================================================
--  Convite Chá de Fraldas do Anthony
--  Schema completo — SQL Editor do Supabase
-- ============================================================
--
--  >>> ANTES DE RODAR: troque o placeholder da senha da /admin
--      no bloco 4 (procure por TROQUE_ESTA_SENHA).
--
--  O script inteiro é idempotente: pode ser executado de novo
--  quantas vezes for preciso, sem dar erro.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


-- ── 1. Confirmações ───────────────────────────────────────────
-- O nome da tabela também está em frontend/src/configuracaoTema.js
-- (campo `tabelaConfirmacoes`).

CREATE TABLE IF NOT EXISTS public.confirmacoes_cha_anthony (
  id         BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome       TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT confirmacoes_cha_anthony_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Tamanho da fralda que o convidado vai levar.
-- Fica NULL quando todos os tamanhos já esgotaram (nesse caso o
-- convidado ainda consegue confirmar só a presença).
ALTER TABLE public.confirmacoes_cha_anthony
  ADD COLUMN IF NOT EXISTS tamanho_fralda TEXT;


-- ── 2. Vagas por tamanho ──────────────────────────────────────
-- `usadas` é um contador; é ele que permite reservar a vaga de
-- forma atômica na função confirmar_presenca (bloco 5).

CREATE TABLE IF NOT EXISTS public.vagas_fralda (
  tamanho TEXT PRIMARY KEY,
  limite  INTEGER NOT NULL DEFAULT 20 CHECK (limite >= 0),
  usadas  INTEGER NOT NULL DEFAULT 0  CHECK (usadas >= 0),
  ordem   INTEGER NOT NULL DEFAULT 0
);

INSERT INTO public.vagas_fralda (tamanho, limite, ordem) VALUES
  ('P', 20, 1),
  ('M', 20, 2),
  ('G', 20, 3)
ON CONFLICT (tamanho) DO NOTHING;


-- ── 3. Senha da /admin ────────────────────────────────────────
-- Guarda só o hash (bcrypt). Esta tabela fica com RLS ligada e
-- NENHUMA policy, então a anon key não consegue lê-la de jeito
-- nenhum — apenas as funções SECURITY DEFINER enxergam.

CREATE TABLE IF NOT EXISTS public.config_admin (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  senha_hash TEXT NOT NULL,
  CONSTRAINT config_admin_linha_unica CHECK (id = 1)
);


-- ── 4. Definir a senha ────────────────────────────────────────
--
--     >>> TROQUE 'TROQUE_ESTA_SENHA' PELA SENHA QUE VOCÊ QUER <<<
--
-- Rodar de novo com outro valor troca a senha.

INSERT INTO public.config_admin (id, senha_hash)
VALUES (1, extensions.crypt('TROQUE_ESTA_SENHA', extensions.gen_salt('bf')))
ON CONFLICT (id) DO UPDATE
  SET senha_hash = EXCLUDED.senha_hash;


-- ── 5. Confirmar presença (reserva a vaga + insere) ───────────
-- Tudo numa transação só. O UPDATE do contador trava a linha:
-- uma transação concorrente espera, relê o `usadas` já atualizado
-- e reavalia `usadas < limite`. É isso que impede dois convidados
-- simultâneos de pegarem a mesma última vaga.

CREATE OR REPLACE FUNCTION public.confirmar_presenca(
  p_nome    TEXT,
  p_tamanho TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_nome TEXT := btrim(coalesce(p_nome, ''));
  v_tam  TEXT := nullif(btrim(upper(coalesce(p_tamanho, ''))), '');
BEGIN
  IF v_nome = '' THEN
    RAISE EXCEPTION 'NOME_VAZIO';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.confirmacoes_cha_anthony c
     WHERE lower(c.nome) = lower(v_nome)
  ) THEN
    RAISE EXCEPTION 'NOME_DUPLICADO';
  END IF;

  IF v_tam IS NOT NULL THEN
    UPDATE public.vagas_fralda v
       SET usadas = v.usadas + 1
     WHERE v.tamanho = v_tam
       AND v.usadas < v.limite;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'TAMANHO_ESGOTADO';
    END IF;
  ELSE
    -- Só aceita sem tamanho se realmente não houver vaga em nenhum.
    IF EXISTS (SELECT 1 FROM public.vagas_fralda v WHERE v.usadas < v.limite) THEN
      RAISE EXCEPTION 'TAMANHO_OBRIGATORIO';
    END IF;
  END IF;

  INSERT INTO public.confirmacoes_cha_anthony (nome, tamanho_fralda)
  VALUES (v_nome, v_tam);
END;
$$;


-- ── 6. Atualizar as cotas (usado pela /admin) ─────────────────
-- p_limites é um JSON no formato {"P": 20, "M": 25, "G": 15}.
-- A senha é conferida aqui dentro, no banco — conferir no
-- JavaScript não adiantaria nada, já que o código roda no
-- navegador do convidado.

CREATE OR REPLACE FUNCTION public.atualizar_vagas(
  p_senha   TEXT,
  p_limites JSONB
)
RETURNS SETOF public.vagas_fralda
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.config_admin ca
     WHERE ca.senha_hash = extensions.crypt(coalesce(p_senha, ''), ca.senha_hash)
  ) THEN
    RAISE EXCEPTION 'SENHA_INVALIDA';
  END IF;

  UPDATE public.vagas_fralda v
     SET limite = greatest((p_limites ->> v.tamanho)::INTEGER, 0)
   WHERE p_limites ? v.tamanho;

  RETURN QUERY
  SELECT * FROM public.vagas_fralda ORDER BY ordem;
END;
$$;


-- ── 7. Manter o contador em dia ao apagar/editar linhas ───────
-- `usadas` é um contador guardado (é ele que permite a reserva
-- atômica no bloco 5). Sem este trigger, apagar uma confirmação na
-- mão deixa a vaga "presa": a linha some, mas o contador não baixa.
--
-- Só dispara em DELETE e UPDATE. Em INSERT não pode disparar, senão
-- contaria dobrado — a função confirmar_presenca já incrementa antes
-- de inserir.

CREATE OR REPLACE FUNCTION public.sincronizar_vagas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.tamanho_fralda IS NOT NULL THEN
      UPDATE public.vagas_fralda
         SET usadas = greatest(usadas - 1, 0)
       WHERE tamanho = OLD.tamanho_fralda;
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.tamanho_fralda IS DISTINCT FROM NEW.tamanho_fralda THEN
    IF OLD.tamanho_fralda IS NOT NULL THEN
      UPDATE public.vagas_fralda
         SET usadas = greatest(usadas - 1, 0)
       WHERE tamanho = OLD.tamanho_fralda;
    END IF;
    IF NEW.tamanho_fralda IS NOT NULL THEN
      UPDATE public.vagas_fralda
         SET usadas = usadas + 1
       WHERE tamanho = NEW.tamanho_fralda;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sincronizar_vagas ON public.confirmacoes_cha_anthony;
CREATE TRIGGER trg_sincronizar_vagas
  AFTER DELETE OR UPDATE ON public.confirmacoes_cha_anthony
  FOR EACH ROW EXECUTE FUNCTION public.sincronizar_vagas();


-- ── 8. Ressincronizar o contador agora ────────────────────────
-- Recalcula `usadas` a partir das linhas que realmente existem.
-- Corrige qualquer divergência anterior ao trigger. Rodar de novo
-- é inofensivo.

UPDATE public.vagas_fralda v
   SET usadas = (SELECT count(*)
                   FROM public.confirmacoes_cha_anthony c
                  WHERE c.tamanho_fralda = v.tamanho);


-- ── 9. RLS e permissões ───────────────────────────────────────

ALTER TABLE public.confirmacoes_cha_anthony ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vagas_fralda             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_admin             ENABLE ROW LEVEL SECURITY;

-- Confirmações: leitura liberada (a /admin lista os confirmados).
DROP POLICY IF EXISTS "select_publico" ON public.confirmacoes_cha_anthony;
CREATE POLICY "select_publico" ON public.confirmacoes_cha_anthony
  FOR SELECT TO anon USING (true);

-- IMPORTANTE: o insert direto sai de cena. Toda confirmação passa
-- pela função confirmar_presenca, que é quem respeita a cota. Com a
-- policy de insert ligada, qualquer um poderia inserir pelo navegador
-- ignorando o limite de fraldas.
DROP POLICY IF EXISTS "insert_publico" ON public.confirmacoes_cha_anthony;

-- Vagas: leitura liberada (o modal mostra quantas restam).
-- Escrita só pelas funções SECURITY DEFINER.
DROP POLICY IF EXISTS "vagas_select_publico" ON public.vagas_fralda;
CREATE POLICY "vagas_select_publico" ON public.vagas_fralda
  FOR SELECT TO anon USING (true);

-- config_admin fica sem nenhuma policy de propósito: anon não lê o hash.

GRANT EXECUTE ON FUNCTION public.confirmar_presenca(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.atualizar_vagas(TEXT, JSONB)   TO anon;


-- ── 10. Conferir o estado ─────────────────────────────────────
--
-- SELECT * FROM public.vagas_fralda ORDER BY ordem;
--
-- SELECT nome, tamanho_fralda, created_at
--   FROM public.confirmacoes_cha_anthony ORDER BY created_at;
--
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE schemaname = 'public'
--    AND tablename IN ('confirmacoes_cha_anthony','vagas_fralda','config_admin');


-- ── 11. Limpeza de teste ──────────────────────────────────────
-- Com o trigger do bloco 7 no lugar, apagar a linha já devolve a vaga
-- sozinho — não precisa mais mexer no contador na mão.
--
-- DELETE FROM public.confirmacoes_cha_anthony WHERE nome ILIKE 'TESTE%';


-- ── Nota ──────────────────────────────────────────────────────
-- De propósito não há UNIQUE (nome). A checagem de nome repetido é
-- feita dentro de confirmar_presenca, que devolve NOME_DUPLICADO e
-- vira a mensagem "Já há confirmação para este nome" na tela.
