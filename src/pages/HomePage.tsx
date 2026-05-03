import { Droplets, Factory, Heart, Leaf, Wheat, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useFetchAllMembers } from "../features/members/members/useMembers";

/** روابط أعلام مخصصة (Supabase) مفهرسة برمز ISO3166-1 alpha-2 كما في عمود `members.flag` */
const MEMBER_FLAG_CUSTOM_URLS: Partial<Record<string, string>> = {
  dz: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Algeria.jpg",
  bh: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Bahrain.jpg",
  km: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Comoros.jpg",
  dj: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Djibouti.jpg",
  eg: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Egypt.jpg",
  ae: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Emirates.jpg",
  iq: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Iraq.jpg",
  jo: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Jordan.jpg",
  kw: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Kuweit.jpg",
  lb: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Lebanon.jpg",
  ly: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Lybia.jpg",
  ma: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Maroc.jpg",
  mr: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Mauritania.jpg",
  om: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Oman.jpg",
  ps: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Palastine.jpg",
  qa: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Qatar.jpg",
  sa: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Saudi%20Arabia.jpg",
  so: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Somalie.jpg",
  sd: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Sudan.jpg",
  sy: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Syria.jpeg",
  tn: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Tunisia.jpg",
  ye: "https://fvainltbuuuozzqyxkom.supabase.co/storage/v1/object/public/Flags/Yemen.jpg",
};

/** يطابق منطق `FlagCell` في جدول الدول: رابط مباشر أو مسار، وإلا رمز ISO + خريطة التخزين أو flagcdn */
function resolveMemberFlagImage(rawFlag: string): {
  src: string;
  srcSet?: string;
} {
  const trimmed = rawFlag.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return { src: trimmed };
  }
  const code = trimmed.toLowerCase();
  const custom = MEMBER_FLAG_CUSTOM_URLS[code];
  if (custom) {
    return { src: custom };
  }
  return {
    src: `https://flagcdn.com/h48/${code}.png`,
    srcSet: `https://flagcdn.com/h96/${code}.png 2x`,
  };
}

const SECTOR_THEMES = [
  {
    title: "الطاقة",
    blurb:
      "تطبيقات سلمية للطاقة النووية وتعزيز أمن الطاقة المستدام في الوطن العربي.",
    icon: Zap,
    accent: "from-amber-500/90 to-orange-600",
    border: "border-amber-200/80",
    image:
      "https://images.unsplash.com/photo-1772376920794-326f1bc87be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "الصحة",
    blurb: "استخدامات تشخيصية وعلاجية للإشعاع والنظائر في خدمة الصحة العامة.",
    icon: Heart,
    accent: "from-rose-500/90 to-pink-600",
    border: "border-rose-200/70",
    image: "/health-nurse-xray.jpg",
  },
  {
    title: "الأمن الغذائي",
    blurb:
      "التحسين الوراثي والمكافحة الآمنة للآفات باستخدام التقنيات النووية والإشعاعية.",
    icon: Wheat,
    accent: "from-lime-600/90 to-emerald-700",
    border: "border-lime-200/70",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
  },
  {
    title: "الموارد المائية",
    blurb:
      "إدارة المياه الجوفية والتنقية والدراسات الإشعاعية لحماية الموارد المائية.",
    icon: Droplets,
    accent: "from-sky-500/90 to-cyan-600",
    border: "border-sky-200/80",
    image:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80",
  },
  {
    title: "البيئة",
    blurb: "الرصد البيئي والحد من التلوث والمساهمة في التكيف مع تغير المناخ.",
    icon: Leaf,
    accent: "from-emerald-500/90 to-teal-600",
    border: "border-emerald-200/80",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "الصناعة والتعدين",
    blurb:
      "التحليل الإشعاعي والتطبيقات الصناعية الآمنة في قطاع التعدين والصناعة.",
    icon: Factory,
    accent: "from-slate-600/90 to-slate-800",
    border: "border-slate-200/80",
    image:
      "https://images.unsplash.com/photo-1758143011530-e5b46487c4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
] as const;

const HEALTH_SECTOR_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1576671414121-aa0c81c869e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const ARAB_LEAGUE_LOGO = "/ArabLeag.png";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&q=80";

const AAEA_LOGO_SRC = ["/logo-AAEA-w.png", "/logo-AAEA-w.jpeg"] as const;

/** حاوية موحّدة لشعاري الجامعة والهيئة في البطل (نفس الارتفاع والعرض الأقصى) */
const HERO_LOGO_SLOT =
  "flex size-20 shrink-0 items-center justify-center sm:size-28 md:size-32";
/** شعار الهيئة أكبر قليلاً من شعار الجامعة */
const HERO_AAEA_LOGO_SLOT =
  "flex size-[5.25rem] shrink-0 items-center justify-center sm:size-[7.25rem] md:size-[9rem]";
const HERO_LOGO_IMG = "max-h-full max-w-full object-contain drop-shadow-md";

/** الدول الأعضاء في الهيئة (14) — كما في النص التعريفي */
const AAEA_MEMBER_STATES_14 = [
  "الأردن",
  "البحرين",
  "تونس",
  "السعودية",
  "السودان",
  "سورية",
  "العراق",
  "فلسطين",
  "الكويت",
  "لبنان",
  "ليبيا",
  "مصر",
  "موريتانيا",
  "اليمن",
] as const;

function AaeaLogo() {
  const [index, setIndex] = useState(0);
  if (index >= AAEA_LOGO_SRC.length) {
    return (
      <div
        className={`${HERO_AAEA_LOGO_SLOT} rounded-xl border border-white/25 bg-white/10 px-1 text-center text-[10px] font-semibold leading-tight text-white backdrop-blur sm:text-xs`}
      >
        الهيئة العربية للطاقة الذرية
      </div>
    );
  }
  return (
    <div className={HERO_AAEA_LOGO_SLOT}>
      <img
        src={AAEA_LOGO_SRC[index]}
        alt="شعار الهيئة العربية للطاقة الذرية"
        className={HERO_LOGO_IMG}
        onError={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}

export function HomePage() {
  const { data: members, isLoading, isError, error } = useFetchAllMembers();

  const memberFlags = useMemo(() => {
    if (!members?.length) return [];
    return members
      .filter(
        (m) =>
          m.member_name != null &&
          String(m.member_name).trim() !== "" &&
          m.flag != null &&
          String(m.flag).trim() !== "",
      )
      .map((m) => {
        const raw = String(m.flag).trim();
        const { src, srcSet } = resolveMemberFlagImage(raw);
        return {
          id: m.id,
          name: String(m.member_name).trim(),
          src,
          srcSet,
        };
      })
      .sort((a, b) => a.id - b.id);
  }, [members]);

  return (
    <div className="space-y-10 pb-4">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200/40 shadow-lg shadow-emerald-900/10">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-50 "
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-950/88 via-teal-900/82 to-emerald-950/85" />
        <div className="pointer-events-none absolute -start-20 -top-20 size-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -end-16 size-64 rounded-full bg-emerald-300/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 px-5 py-8 text-white sm:px-8 sm:py-10">
          <div
            className="grid w-full items-center gap-3 sm:gap-5 md:gap-8 [grid-template-columns:auto_minmax(0,1fr)_auto]"
            dir="ltr"
          >
            <div className="flex justify-center">
              <div className={HERO_LOGO_SLOT}>
                <img
                  src={ARAB_LEAGUE_LOGO}
                  alt="شعار جامعة الدول العربية"
                  className={HERO_LOGO_IMG}
                />
              </div>
            </div>
            <h1
              className="min-w-0 px-1 text-center text-balance text-base font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl lg:text-4xl"
              dir="rtl"
            >
              الهيئة العربية للطاقة الذرية
            </h1>
            <div className="flex justify-center">
              <AaeaLogo />
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl space-y-6 text-center">
            <div className="w-full max-w-none space-y-4 text-pretty">
              <p className="text-sm leading-[1.75] text-emerald-50/95 sm:text-base">
                الهيئة العربية للطاقة الذرية منظمة علمية عربية متخصصة تعمل في
                نطاق جامعة الدول العربية، وتعنى بالعلوم النووية وتطبيقاتها في
                المجال السلمي، كما تسعى إلى تطوير العمل العلمي العربي المشترك
                ومواكبة التقدم العلمي والتقني العالمي في هذا المجال.
              </p>
              <p className="text-sm leading-[1.75] text-emerald-50/95 sm:text-base">
                تهتم الهيئة بخلق وعي علمي وتقني لدى المواطن العربي في العلوم
                النووية ومجالات استخداماتها السلمية، والعمل على خلق نقلة علمية
                وتقنية نوعية في مسار التطور الحضاري العربي.
              </p>
            </div>
            <div className="mx-auto max-w-prose">
              <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-emerald-50 shadow-sm backdrop-blur-sm sm:text-base">
                <span className="text-emerald-200/90">بدء العمل الفعلي: </span>
                <time dateTime="1989-02-15">15 فبراير 1989</time>
                {/* <span className="text-emerald-200/80"> (1989/2/15)</span> */}
              </p>
            </div>

            <div className="mx-auto -mt-4 max-w-prose space-y-4 border-t border-white/20 pt-4 text-pretty">
              <p className="text-base leading-[1.75] text-emerald-100/95 sm:text-lg">
                يقع المقر الرسمي الدائم للهيئة في{" "}
                <span className="font-semibold text-white">مدينة تونس</span>{" "}
                بالجمهورية التونسية.
              </p>
              <div className="text-start">
                <p className="mb-3 text-center text-sm font-semibold text-emerald-100 sm:text-base">
                  الدول الأعضاء في الهيئة{" "}
                  <span className="tabular-nums text-emerald-200">(14)</span>
                </p>
                <ul
                  className="flex flex-wrap justify-center gap-2 sm:justify-start"
                  aria-label="دول أعضاء الهيئة العربية للطاقة الذرية"
                >
                  {AAEA_MEMBER_STATES_14.map((name) => (
                    <li key={name}>
                      <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-emerald-50/95 shadow-sm sm:text-sm">
                        {name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm leading-relaxed text-emerald-100/90 sm:text-base">
                ترحب الهيئة العربية للطاقة الذرية بانضمام بقية الدول العربية
                إليها.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 border-b border-emerald-200/80 pb-3">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            المحاور الرئيسية
          </h2>
          <p className="text-sm text-slate-600">
            مجالات يُسهم فيها التعاون الفني والتنظيمي بين الدول الأعضاء.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SECTOR_THEMES.map(
            ({ title, blurb, icon: Icon, accent, border, image }) => (
              <article
                key={title}
                className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-md ${border}`}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      if (title !== "الصحة") return;
                      const el = e.currentTarget;
                      if (el.dataset.fallback === "1") return;
                      el.dataset.fallback = "1";
                      el.src = HEALTH_SECTOR_IMAGE_FALLBACK;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/25 to-transparent" />
                  <div
                    className={`absolute bottom-3 end-3 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${accent}`}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {blurb}
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 border-b border-emerald-200/80 pb-3">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            الدول الأعضاء بجامعة الدول العربية
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          {isLoading ? (
            <p className="text-center text-sm text-slate-600" dir="rtl">
              جاري تحميل بيانات الدول الأعضاء…
            </p>
          ) : isError ? (
            <p
              className="text-center text-sm text-red-700"
              dir="rtl"
              role="alert"
            >
              {error instanceof Error
                ? error.message
                : "تعذر تحميل أسماء الدول الأعضاء"}
            </p>
          ) : memberFlags.length === 0 ? (
            <p className="text-center text-sm text-slate-600" dir="rtl">
              لا توجد دول للعرض (تحقق من تعبئة «الدولة» و«العلم» في جدول الدول
              الأعضاء).
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11">
              {memberFlags.map(({ id, name, src, srcSet }) => (
                <li
                  key={id}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-center transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  <img
                    src={src}
                    srcSet={srcSet}
                    alt={`علم ${name}`}
                    width={48}
                    height={36}
                    className="h-9 w-auto rounded object-cover shadow-sm"
                    loading="lazy"
                  />
                  <span className="line-clamp-2 text-[0.65rem] font-medium leading-tight text-slate-700 sm:text-xs">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
