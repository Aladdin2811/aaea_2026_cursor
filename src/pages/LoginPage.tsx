import { Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session) {
        navigate('/', { replace: true })
      }
    })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !password) {
      toast.error('يرجى إدخال البريد وكلمة المرور')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    })
    setSubmitting(false)

    if (error) {
      toast.error(error.message || 'فشل تسجيل الدخول')
      return
    }

    toast.success('تم تسجيل الدخول')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-emerald-50/80 px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgb(16 185 129 / 0.12), transparent 45%),
            radial-gradient(circle at 80% 80%, rgb(20 184 166 / 0.1), transparent 45%)`,
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/logo-AAEA-w.jpeg"
            alt=""
            className="size-16 rounded-2xl object-contain shadow-md shadow-slate-200/80 ring-1 ring-slate-100"
          />
          <h1 className="mt-4 text-xl font-bold text-slate-900">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-slate-600">الهيئة العربية للطاقة الذرية</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-8">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                  <Mail className="size-4" strokeWidth={1.75} />
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pe-3 ps-10 text-sm text-slate-900 outline-none ring-emerald-500/25 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2"
                  placeholder="name@example.com"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                  <Lock className="size-4" strokeWidth={1.75} />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pe-3 ps-10 text-sm text-slate-900 outline-none ring-emerald-500/25 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2"
                  placeholder="••••••••"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting ? 'جاري الدخول…' : 'دخول'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            حسابات المستخدمين تُدار من Supabase Auth. تواصل مع المسؤول إذا نسيت كلمة المرور.
          </p>
        </div>
      </div>
    </div>
  )
}
