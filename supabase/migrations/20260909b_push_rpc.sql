-- Gravar/apagar inscrição via funções SECURITY DEFINER: o app anônimo nunca
-- precisa enxergar a tabela, e a segunda gravação (upsert) funciona.
create or replace function public.save_push_subscription(
  p_endpoint text, p_subscription jsonb, p_tz text default 'America/Sao_Paulo',
  p_lang text default null, p_name text default null, p_last_study date default null
) returns void language sql security definer set search_path = public as $$
  insert into public.push_subscriptions (endpoint, subscription, tz, lang, name, last_study)
  values (p_endpoint, p_subscription, coalesce(p_tz, 'America/Sao_Paulo'), p_lang, p_name, p_last_study)
  on conflict (endpoint) do update set
    subscription = excluded.subscription,
    tz = excluded.tz,
    lang = coalesce(excluded.lang, push_subscriptions.lang),
    name = coalesce(excluded.name, push_subscriptions.name),
    last_study = greatest(coalesce(excluded.last_study, push_subscriptions.last_study), coalesce(push_subscriptions.last_study, excluded.last_study));
$$;

create or replace function public.delete_push_subscription(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint;
$$;

revoke all on function public.save_push_subscription(text, jsonb, text, text, text, date) from public;
revoke all on function public.delete_push_subscription(text) from public;
grant execute on function public.save_push_subscription(text, jsonb, text, text, text, date) to anon, authenticated;
grant execute on function public.delete_push_subscription(text) to anon, authenticated;

-- As políticas diretas de INSERT/DELETE deixam de ser necessárias.
drop policy if exists "anon can insert own subscription" on public.push_subscriptions;
drop policy if exists "anon can delete by endpoint" on public.push_subscriptions;
