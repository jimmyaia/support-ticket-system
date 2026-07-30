import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  HeadphonesIcon,
  MessageSquare,
  Smartphone,
  BarChart3,
  Users,
  Zap,
  Shield,
  Star,
  Calendar,
  CreditCard,
  Bot,
  Globe,
  Clock,
  TrendingUp,
} from "lucide-react";

// ── CONFIG ─────────────────────────────────────────────────────────────────────
// Replace these two URLs before going live
const DEMO_CALENDAR_URL = "https://calendly.com/YOUR_LINK"; // ← swap in your Calendly / GHL calendar link
const STRIPE_PAYMENT_URL = "https://buy.stripe.com/YOUR_LINK"; // ← swap in your Stripe payment link
// ───────────────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: MessageSquare,
    title: "Omnichannel Notifications",
    description:
      "Every ticket update triggers automated Email, SMS, and WhatsApp messages to your customers — powered by GoHighLevel.",
  },
  {
    icon: Bot,
    title: "AI-Powered First Response",
    description:
      "Your AI bot acknowledges every ticket instantly, 24/7 — so customers never feel ignored, even at 2 AM.",
  },
  {
    icon: Users,
    title: "Team Assignment & Notes",
    description:
      "Assign tickets to specific staff, leave internal notes, and track every action with a full activity log.",
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    description:
      "Monthly volume, completion rates, and average time-to-resolve — know exactly how your support team is performing.",
  },
  {
    icon: Globe,
    title: "Your Own Branded Portal",
    description:
      "Each client gets their own subdomain (yourcompany.aia-supportdesk.com) with their logo and custom service menu.",
  },
  {
    icon: Shield,
    title: "Fully Managed & Supported",
    description:
      "We set everything up, configure your automations, and monitor your system. If something breaks, we fix it.",
  },
];

const steps = [
  {
    step: "01",
    title: "We set everything up for you",
    desc: "After payment, we schedule a 30-minute onboarding call. We configure your portal, automations, and AI bot — you don't touch a thing.",
  },
  {
    step: "02",
    title: "Your customers submit tickets",
    desc: "They fill out a simple form on your branded portal. A ticket number is generated instantly and they receive an automated confirmation.",
  },
  {
    step: "03",
    title: "Your team resolves issues",
    desc: "Your staff works tickets from a clean dashboard. Every status change triggers an automatic update to the customer via SMS, email, or WhatsApp.",
  },
];

const included = [
  "Branded subdomain portal (yourcompany.aia-supportdesk.com)",
  "Unlimited tickets & unlimited staff seats",
  "Automated Email, SMS & WhatsApp notifications",
  "AI bot first-response (24/7)",
  "GoHighLevel workflow integration",
  "Custom product/service dropdown",
  "Internal team notes & staff assignment",
  "Reporting dashboard",
  "Full setup & onboarding included",
  "Ongoing monitoring & support",
  "No contracts — cancel anytime",
];

const faqs = [
  {
    q: "Do I need a GoHighLevel account?",
    a: "We provide a GoHighLevel sub-account as part of your setup. If you already have GHL, we can connect to your existing account.",
  },
  {
    q: "How long does setup take?",
    a: "Most clients are fully live within 48 hours of their onboarding call. We handle everything — you just show up to the call.",
  },
  {
    q: "Can I customize the ticket form for my business?",
    a: "Yes. We configure your product/service dropdown and any other options during onboarding. Changes can be made anytime.",
  },
  {
    q: "What happens if I cancel?",
    a: "Cancel anytime with no penalties. Your portal stays active until the end of your billing period.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees. Just $149/month, all-inclusive.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">AIA SupportDesk</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                <Calendar className="w-3.5 h-3.5" />
                Book a Demo
              </Button>
            </a>
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border-primary/20">
            Powered by GoHighLevel + AI
          </Badge>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-slate-900 leading-[1.08] mb-6 text-balance max-w-4xl mx-auto">
            The support ticket system your customers will{" "}
            <span className="text-primary italic">actually love</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Automated SMS, email & WhatsApp updates. AI first-response. A branded portal your team can manage in minutes.
            <strong className="text-slate-700"> $149/month. No contracts. Fully set up for you.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 px-10 h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <CreditCard className="w-4 h-4" />
                Start for $149/month
              </Button>
            </a>
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 px-10 h-14 text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                <Calendar className="w-4 h-4" />
                Schedule a Free Demo
              </Button>
            </a>
          </div>
          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            {["No setup fees", "No long-term contracts", "Cancel anytime", "Full setup included", "Live in 48 hours"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM / AGITATION ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6 leading-tight">
            Your customers are submitting support requests.<br />
            <span className="text-slate-400">Are they hearing back?</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Most businesses lose customers not because they can't solve problems — but because customers feel ignored while waiting.
            A ticket submitted into silence is worse than no ticket system at all.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: Clock, stat: "68%", label: "of customers leave because they feel unappreciated or ignored" },
              { icon: Smartphone, stat: "90%", label: "of customers prefer SMS updates over checking a portal manually" },
              { icon: TrendingUp, stat: "5×", label: "more likely to retain a customer when you communicate proactively" },
            ].map((item) => (
              <div key={item.stat} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <item.icon className="w-5 h-5 text-primary mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border-primary/20">
              Everything included
            </Badge>
            <h2 className="font-display text-4xl font-semibold text-slate-900 mb-4">
              Not just a ticket form.<br />A complete support engine.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Everything you need to deliver world-class support — set up, configured, and managed for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border-primary/20">
              Simple process
            </Badge>
            <h2 className="font-display text-4xl font-semibold text-slate-900 mb-4">
              Live in 48 hours. Zero technical work.
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              We handle every detail of setup. You focus on your customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={item.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%_-_16px)] w-8 h-px bg-slate-200 z-10" />
                )}
                <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm h-full">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-5 shadow-sm shadow-primary/30">
                    <span className="text-xs font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border-primary/20">
              Simple pricing
            </Badge>
            <h2 className="font-display text-4xl font-semibold text-slate-900 mb-4">
              One plan. Everything included.
            </h2>
            <p className="text-slate-500 text-lg">No tiers. No hidden fees. No surprises.</p>
          </div>
          <div className="relative bg-slate-900 rounded-3xl p-10 md:p-14 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-bold">$149</span>
                    <span className="text-slate-400 text-lg">/month</span>
                  </div>
                  <p className="text-slate-400 mb-8">Per workspace. Unlimited staff. Cancel anytime.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {included.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:min-w-[220px]">
                  <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full gap-2 h-13 text-base font-semibold bg-white text-slate-900 hover:bg-slate-100">
                      <CreditCard className="w-4 h-4" />
                      Get Started Now
                    </Button>
                  </a>
                  <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg" className="w-full gap-2 h-13 text-base border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent">
                      <Calendar className="w-4 h-4" />
                      Book a Free Demo First
                    </Button>
                  </a>
                  <p className="text-xs text-slate-500 text-center pt-1">No setup fees · No contracts · Cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / TRUST ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold text-slate-900 mb-3">
              Built for businesses that take support seriously
            </h2>
            <p className="text-slate-500">Everything your customers expect. Everything your team needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Our customers used to email us and wonder if anyone saw it. Now they get a text confirmation in seconds. The difference in trust is night and day.",
                name: "Agency Owner",
                role: "GoHighLevel Partner",
              },
              {
                quote: "Setup was done in one call. We were live the next morning. I didn't have to configure a single thing — they handled everything.",
                name: "SaaS Founder",
                role: "Software Company",
              },
              {
                quote: "The AI bot handles first response 24/7. By the time my team gets in the next morning, customers already feel taken care of.",
                name: "Operations Manager",
                role: "Service Business",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-semibold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-primary py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Zap className="w-10 h-10 text-primary-foreground/60 mx-auto mb-6" />
          <h2 className="font-display text-4xl font-semibold text-primary-foreground mb-5 leading-tight">
            Ready to give your customers<br />the support they deserve?
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            Join businesses that have transformed their customer support with AIA SupportDesk.
            $149/month. No contracts. Live in 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2 px-10 h-14 text-base font-semibold shadow-lg">
                <CreditCard className="w-4 h-4" />
                Start for $149/month
              </Button>
            </a>
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 px-10 h-14 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                <Calendar className="w-4 h-4" />
                Book a Free Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <HeadphonesIcon className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">AIA SupportDesk</span>
          </div>
          <p className="text-xs text-slate-400 text-center">
            $149/month · No contracts · Cancel anytime · Full setup included
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <a href="/submit" className="hover:text-slate-600 transition-colors">Submit a Ticket</a>
            <a href="/check-status" className="hover:text-slate-600 transition-colors">Check Status</a>
            <a href="/login" className="hover:text-slate-600 transition-colors">Staff Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
