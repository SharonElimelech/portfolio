// Work history — sits between the skills (Discipline) and the projects (Arsenal).
const ROLES = [
  {
    company: 'Landly',
    role: 'Full-Stack Developer · Part-time',
    period: 'Sep 2026 — Present',
    context: 'Real-estate investment platform · Next.js · TypeScript · Supabase · n8n · Pipedrive',
    points: [
      'Built a consent-gated visitor-intent pipeline end to end — Next.js event capture, least-privilege Postgres storage with retention, and an n8n consumer that scores leads into Pipedrive.',
      'Merged 20 PRs in my first 4 weeks under code review, validated in a containerized CI replica.',
      'Traced and repaired the WhatsApp → CRM lead intake across ManyChat, Make and Pipedrive, and cut ~2,800 automation runs a month.',
    ],
  },
  {
    company: 'Hadar Elimelech Law Office',
    role: 'Full-Stack Developer · Freelance',
    period: 'Feb 2026 — Present',
    context: 'Sole developer of the firm’s client-intake and case-management systems',
    points: [
      'WhatsApp AI customer-service agent in production — answers clients 24/7 from an approved knowledge base and hands off to the lawyer with the full transcript.',
      'Insolvency case-management CRM — an offline-first Electron desktop app with auto-backup and multi-PC sync, plus a cloud web edition.',
      'The firm’s website, built on Next.js and Cloudflare Workers.',
    ],
  },
  {
    company: 'Tach In & self-employed',
    role: 'Mathematics Tutor',
    period: '2021 — Present',
    context: '5 years of teaching — explaining hard things simply',
    points: [],
  },
];

export default function ExperienceSection() {
  return (
    <section id="experience" className="relative w-full py-32 md:py-40" style={{ background: '#050505' }}>
      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-2 h-2 rounded-full bg-crimson animate-glow-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-crimson uppercase">Experience</span>
        </div>
        <h2 className="font-oswald text-4xl md:text-6xl lg:text-7xl text-ghost tracking-tight mb-16">WHERE I SHIP</h2>

        <div className="space-y-5">
          {ROLES.map((r) => (
            <article key={r.company} className="glass-panel p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                <h3 className="font-oswald text-xl md:text-2xl text-ghost tracking-wide">
                  {r.company} <span className="text-crimson">/</span> {r.role}
                </h3>
                <span className="font-mono text-[10px] tracking-[0.2em] text-ash uppercase whitespace-nowrap">{r.period}</span>
              </div>
              <p className="font-mono text-[10px] tracking-[0.15em] text-ash uppercase mb-4">{r.context}</p>
              {r.points.length > 0 && (
                <ul className="space-y-2">
                  {r.points.map((p) => (
                    <li key={p} className="font-space text-sm text-ash leading-relaxed pl-4 relative">
                      <span className="absolute left-0 text-crimson">›</span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
