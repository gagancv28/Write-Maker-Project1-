import Link from "next/link";
import { PenLine, ShieldCheck, Zap, Star, Users, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#122131_0%,_transparent_60%)]" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-tertiary animate-pulse" />
          Trusted by 2,000+ clients worldwide
        </div>

        <h1 className="text-5xl md:text-7xl font-space font-bold text-white tracking-tighter mb-6 max-w-4xl mx-auto leading-tight">
          Connect with{" "}
          <span className="text-brand-primary">Expert Writers</span>{" "}
          for Every Project
        </h1>

        <p className="text-xl text-brand-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
          WriteMarket is the premier freelance writing marketplace. Post
          assignments, find talented writers, and get quality content — fast,
          secure, and hassle-free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-10 py-4 bg-brand-primary text-brand-bg font-bold rounded-brand-sm text-sm tracking-widest uppercase hover:scale-105 transition-all"
            style={{ boxShadow: "0 0 20px -5px rgba(235,178,255,0.5)" }}
          >
            Get Started Free
          </Link>
          <Link
            href="/assignments"
            className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-brand-sm text-sm tracking-widest uppercase hover:bg-white/10 transition-all"
          >
            Browse Assignments
          </Link>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,000+", label: "Active Clients" },
            { value: "5,400+", label: "Writers" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "24h", label: "Avg. Delivery" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-space font-bold text-brand-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-brand-secondary tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-primary mb-4">
            Why WriteMarket
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-white tracking-tighter">
            Everything you need to{" "}
            <span className="text-brand-tertiary">get it done</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <PenLine size={36} className="text-brand-primary" />,
              title: "Post Assignments",
              desc: "Describe your project, set a budget, and receive bids from qualified writers within hours.",
            },
            {
              icon: <Users size={36} className="text-brand-tertiary" />,
              title: "Vetted Writers",
              desc: "Every writer is reviewed and rated by real clients. Browse portfolios and pick the perfect match.",
            },
            {
              icon: <ShieldCheck size={36} className="text-brand-primary" />,
              title: "Secure Payments",
              desc: "Funds are held in escrow until you approve the work. Your money is always protected.",
            },
            {
              icon: <Zap size={36} className="text-brand-tertiary" />,
              title: "Fast Turnaround",
              desc: "Urgent deadline? Filter writers by availability and get same-day delivery on rush projects.",
            },
            {
              icon: <FileText size={36} className="text-brand-primary" />,
              title: "Any Content Type",
              desc: "Blog posts, copywriting, technical docs, academic work — whatever you need, we have a writer for it.",
            },
            {
              icon: <Star size={36} className="text-brand-tertiary" />,
              title: "Rated & Reviewed",
              desc: "Transparent ratings and reviews help you make confident hiring decisions every time.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-card p-8 rounded-brand-lg flex flex-col gap-4"
            >
              <div>{f.icon}</div>
              <h3 className="text-lg font-space font-bold text-white">
                {f.title}
              </h3>
              <p className="text-brand-secondary text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-brand-primary/5 -z-10" />
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-space font-bold text-white mb-6 tracking-tighter">
            Ready to find your{" "}
            <span className="text-brand-primary">perfect writer?</span>
          </h2>
          <p className="text-xl text-brand-secondary mb-12">
            Join thousands of clients who trust WriteMarket for their content needs.
          </p>
          <Link
            href="/register"
            className="inline-block px-12 py-5 bg-brand-primary text-brand-bg font-bold rounded-brand-sm text-sm tracking-[0.2em] uppercase hover:scale-105 transition-all"
            style={{ boxShadow: "0 0 20px -5px rgba(235,178,255,0.5)" }}
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-space font-bold text-white">
            Write<span className="text-brand-primary">Market</span>
          </span>
          <span>© {new Date().getFullYear()} WriteMarket. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-brand-primary transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-brand-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
