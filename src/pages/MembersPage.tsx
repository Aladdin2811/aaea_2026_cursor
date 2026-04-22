import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { fetchMemberCountries, updateMemberCountry } from '../api/memberCountries'
import { getAgencyTogglePatch } from '../data/memberCountries'
import { flagEmojiFromIso2 } from '../lib/flagEmoji'
import type { Members } from '../types/members'

function formatPercent(value: number | null): string {
  if (value === null) return '—'
  return `${value.toLocaleString('ar-EG', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}٪`
}

export function MembersPage() {
  const queryClient = useQueryClient()
  const {
    data: rows = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMemberCountries,
  })

  const mutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Members>
    }) => {
      await updateMemberCountry(id, patch)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('تم حفظ التعديل')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'تعذّر حفظ التعديل')
    },
  })

  useEffect(() => {
    if (!isError || !error) return
    toast.error(error instanceof Error ? error.message : 'تعذّر تحميل البيانات', {
      id: 'members-load-error',
    })
  }, [isError, error])

  const agencyCount = rows.filter((r) => r.org_member).length
  const busyId = mutation.isPending && mutation.variables?.id ? mutation.variables.id : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            الدول الأعضاء بجامعة الدول العربية
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            البيانات مُحمّلة من جدول <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">member_countries</code> في
            Supabase. يمكن تعديل عمود «عضو بالهيئة» مع حفظ التغييرات في قاعدة البيانات.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2 text-sm text-emerald-900">
          <span className="font-medium">أعضاء الهيئة:</span>{' '}
          <span className="tabular-nums">{agencyCount}</span> /{' '}
          <span className="tabular-nums">{rows.length}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="w-14 px-3 py-3 text-center">
                  #
                </th>
                <th scope="col" className="px-3 py-3">
                  اسم الدولة
                </th>
                <th scope="col" className="w-20 px-2 py-3 text-center">
                  العلم
                </th>
                <th scope="col" className="w-36 px-3 py-3 whitespace-nowrap">
                  نسبة المساهمة
                </th>
                <th scope="col" className="min-w-[10rem] px-3 py-3">
                  ملاحظات
                </th>
                <th scope="col" className="w-40 px-3 py-3 text-center">
                  عضو بالهيئة
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-slate-500">
                    جاري تحميل البيانات…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-slate-500">
                    لا توجد صفوف في الجدول. نفّذ ترحيل SQL في <code className="text-xs">supabase/migrations</code> ثم
                    أعد التحميل.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 last:border-0 ${
                      index % 2 === 1 ? 'bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-center tabular-nums text-slate-500">
                      {row.sort_order}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900">{row.member_name}</td>
                    <td className="px-2 py-3 text-center" title={row.flag}>
                      <span
                        className="inline-flex size-10 items-center justify-center rounded-lg bg-slate-50 text-2xl leading-none ring-1 ring-slate-100"
                        aria-hidden
                      >
                        {flagEmojiFromIso2(row.flag)}
                      </span>
                      <span className="sr-only">علم {row.member_name}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-800">
                      {formatPercent(row.member_ratio)}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-slate-600">
                      <span className="line-clamp-2">{row.member_notes || '—'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          id={`agency-${row.id}`}
                          checked={row.org_member}
                          disabled={busyId === row.id}
                          onChange={(e) => {
                            const patch = getAgencyTogglePatch(row.id, e.target.checked)
                            mutation.mutate({ id: row.id, patch })
                          }}
                          className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/40 disabled:opacity-50"
                        />
                        <label
                          htmlFor={`agency-${row.id}`}
                          className="cursor-pointer select-none text-xs text-slate-600"
                        >
                          {row.org_member ? 'نعم' : 'لا'}
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
