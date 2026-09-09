-- Inscrições de push + último dia de estudo por aparelho.
-- Anônimos (o app) podem inserir e apagar a própria linha pelo endpoint
-- (URL secreta gerada pelo navegador). Não podem listar: sem política de SELECT.
-- O job de envio usa a chave de serviço, que ignora RLS.

create table if not exists public.push_subscriptions (
  endpoint     text primary key,
  subscription jsonb not null,
  tz           text not null default 'America/Sao_Paulo',
  lang         text,
  name         text,
  last_study   date,
  nudge_date   date,
  nudges       integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "anon can insert own subscription" on public.push_subscriptions;
create policy "anon can insert own subscription"
  on public.push_subscriptions for insert to anon with check (true);

drop policy if exists "anon can delete by endpoint" on public.push_subscriptions;
create policy "anon can delete by endpoint"
  on public.push_subscriptions for delete to anon using (true);

-- Higiene: linhas sem estudo há 90 dias podem ser apagadas pelo job.
create index if not exists push_subscriptions_last_study_idx on public.push_subscriptions (last_study);
