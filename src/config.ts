// Configuração PÚBLICA do app (vai dentro do JavaScript de qualquer forma).
// A segurança do banco vem das políticas RLS, não do sigilo destes valores.
// Variáveis VITE_* sobrescrevem os padrões (útil para outro projeto Supabase).
// Segredos de verdade (service_role, VAPID privada) nunca entram aqui.

const env = import.meta.env as Record<string, string | undefined>

export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://cpiwakupodimajvormhj.supabase.co'
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaXdha3Vwb2RpbWFqdm9ybWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODA3MDYsImV4cCI6MjEwNDU1NjcwNn0.gKl8EXcNlb-BarnfQTNWCt47hdzwHUHsmnpJNYQ_50Q'
export const VAPID_PUBLIC_KEY = env.VITE_VAPID_PUBLIC_KEY || 'BHDqwn1Ae1o4eMJ_RkStdlPgdis88IF4kSa51U7O7pG_2Srbdn1PAwFjKE6oIU8mEcjXHoKf08PA6jjStaYol4A'
