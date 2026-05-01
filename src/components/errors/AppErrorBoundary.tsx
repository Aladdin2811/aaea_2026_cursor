import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

/**
 * يمنع سقوط التطبيق بالكامل عند خطأ غير متوقع في الواجهة.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[AppErrorBoundary]", error, info.componentStack);
    }
  }

  render(): ReactNode {
    if (this.state.error != null) {
      return (
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-10 text-center"
          dir="rtl"
          lang="ar"
        >
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">
              حدث خطأ غير متوقع
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              تعذّر عرض هذه الشاشة. يمكنك إعادة المحاولة أو تحديث الصفحة. إذا
              تكرّر الخطأ، أبلِغ فريق الدعم.
            </p>
            {import.meta.env.DEV ? (
              <pre className="mt-4 max-h-40 overflow-auto break-words rounded-lg bg-slate-100 p-3 text-right text-xs text-red-800 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                onClick={() => {
                  this.setState({ error: null });
                }}
              >
                إعادة المحاولة
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  window.location.reload();
                }}
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
