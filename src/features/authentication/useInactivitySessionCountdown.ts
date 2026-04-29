import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseInactivitySessionCountdownArgs = {
  enabled: boolean;
  timeoutMs: number;
  onExpire?: () => void;
};

function clampNonNegative(n: number) {
  return n < 0 ? 0 : n;
}

/**
 * يحسب الوقت المتبقي بسبب "عدم النشاط" داخل التطبيق.
 * - يعيد العداد عند أي تفاعل: click/keydown/mousemove/scroll/touchstart
 * - يمكن تمرير `onExpire` لتنفيذ تسجيل الخروج أو أي سلوك عند انتهاء المهلة
 */
export function useInactivitySessionCountdown({
  enabled,
  timeoutMs,
  onExpire,
}: UseInactivitySessionCountdownArgs) {
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // لا نستدعي Date.now أثناء الـrender (يُعتبر impure).
  // سيتم ملؤها داخل effect عند تفعيل العداد.
  const lastActivityAtRef = useRef<number>(0);
  const expiredRef = useRef(false);

  const [remainingMs, setRemainingMs] = useState(() =>
    enabled ? timeoutMs : 0,
  );

  const reset = useCallback(() => {
    lastActivityAtRef.current = Date.now();
    expiredRef.current = false;
    setRemainingMs(timeoutMs);
  }, [timeoutMs]);

  const tick = useCallback(() => {
    const elapsed = Date.now() - lastActivityAtRef.current;
    const nextRemaining = clampNonNegative(timeoutMs - elapsed);
    setRemainingMs(nextRemaining);

    if (nextRemaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      expiredRef.current = false;
      return;
    }

    // عند التفعيل نبدأ العداد من الآن (بدون استدعاء setState مباشرة داخل useEffect)
    lastActivityAtRef.current = Date.now();
    expiredRef.current = false;
    queueMicrotask(() => setRemainingMs(timeoutMs));

    // نعيد العداد فقط عند الضغط على عنصر تفاعلي (زر/لينك/حقل إدخال)،
    // وليس مجرد الضغط على فراغ.
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;

      // يغطي الأيقونات داخل الأزرار/اللينكات لأننا نبحث عن أقرب عنصر تفاعلي
      const interactive = t.closest(
        'button, a[href], input, select, textarea, [role="button"]',
      );

      if (interactive) reset();
    };

    const onKeyDown = () => reset();

    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    const intervalId = window.setInterval(tick, 1000);
    // تحديث أولي غير متزامن (لتجنب setState بشكل "مباشر" داخل body الـuseEffect)
    queueMicrotask(() => tick());

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, reset, tick, timeoutMs]);

  const remainingSeconds = useMemo(
    () => Math.floor(remainingMs / 1000),
    [remainingMs],
  );

  return { remainingMs, remainingSeconds };
}

