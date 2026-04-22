import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
        <Construction className="size-7" strokeWidth={1.75} />
      </div>
      <h2 className="mt-6 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-4 text-xs text-slate-500">هذه الصفحة قيد التطوير ضمن الخطة التدريجية.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        العودة إلى لوحة التحكم
      </Link>
    </div>
  )
}
