export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  align = "center",
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-800/70 bg-slate-950/70 p-8 shadow-2xl shadow-emerald-500/10 sm:p-12">
      <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="space-y-6">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
              {eyebrow}
            </span>
          ) : null}
          <div className="space-y-4">
            <h1
              className={`text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl ${
                align === "left" ? "text-left" : ""
              }`}
            >
              {title}
            </h1>
            {description ? (
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>
        {children ? <div className="relative">{children}</div> : null}
      </div>
    </section>
  );
}
