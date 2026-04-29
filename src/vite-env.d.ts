/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** اسم بديل لمفتاح anon العام */
  readonly VITE_SUPABASE_KEY?: string
  /** مهلة الجلسة بالدقائق قبل تسجيل الخروج التلقائي عند عدم النشاط */
  readonly VITE_SESSION_TIMEOUT_MINUTES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
