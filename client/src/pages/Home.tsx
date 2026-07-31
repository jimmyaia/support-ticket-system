import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  HeadphonesIcon,
  MessageSquare,
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
  Phone,
  FileText,
  Mic,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// ── CONFIG ─────────────────────────────────────────────────────────────────────
const DEMO_CALENDAR_URL = "https://calendly.com/YOUR_LINK";
const STRIPE_PAYMENT_URL = "https://buy.stripe.com/YOUR_LINK";
// ───────────────────────────────────────────────────────────────────────────────

const included = [
  "Voice bot intake (inbound calls)",
  "SMS & WhatsApp chatbot intake",
  "Branded web portal with custom form",
  "Automated Email, SMS & WhatsApp notifications",
  "AI bot first-response (24/7)",
  "GoHighLevel workflow integration",
  "Internal team notes & staff assignment",
  "Reporting dashboard",
  "Unlimited tickets & unlimited staff seats",
  "Full setup & onboarding included",
  "Ongoing monitoring & support",
  "No contracts — cancel anytime",
];

const faqs = [
  {
    q: "Do I need a GoHighLevel account?",
    a: "We provide a GoHighLevel sub-account as part of your setup. If you already have GHL, we can connect to your existing account. The voice bot and chat bot are powered by GHL's built-in AI — no extra software required.",
  },
  {
    q: "How does the voice bot work exactly?",
    a: "When a customer calls your designated support number, GHL's Voice AI answers, asks a few questions to capture the issue, and automatically creates a ticket in your dashboard. The caller receives a text with their ticket number immediately after.",
  },
  {
    q: "Does the chat bot work on WhatsApp?",
    a: "Yes. The GHL Conversation AI works on both SMS and WhatsApp. Customers can text or WhatsApp your number and the bot handles the entire intake conversation.",
  },
  {
    q: "How long does setup take?",
    a: "Most clients are fully live within 48 hours of their onboarding call. We handle everything — voice bot, chat bot, web portal, and GHL automations. You just show up to the call.",
  },
  {
    q: "Can I customize the form and bot questions for my business?",
    a: "Yes. We configure your product/service dropdown, bot conversation flow, and any other options during onboarding. Changes can be made anytime.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees. Just $149/month, all-inclusive. Voice bot, chat bot, web form, automations, and full support — all in one price.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <HeadphonesIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">AIA SupportDesk</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-white/40">
            <a href="#channels" className="hover:text-white/80 transition-colors duration-200">How it works</a>
            <a href="#features" className="hover:text-white/80 transition-colors duration-200">Features</a>
            <a href="#pricing" className="hover:text-white/80 transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-white/80 transition-colors duration-200">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-all duration-200">
                <Calendar className="w-3.5 h-3.5" />
                Book a Demo
              </button>
            </a>
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-400 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-blue-500/20">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-blue-600/12 via-violet-600/6 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-8">
            <Sparkles className="w-3 h-3" />
            The only support system built for GHL agencies
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.04] mb-6 tracking-tight">
            <span className="text-white">Voice. Chat. Form.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
              Every customer,
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 to-blue-400 bg-clip-text text-transparent">
              every channel.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
            Your customers can call, text, WhatsApp, or fill out a form — every single one creates a support ticket automatically.{" "}
            <span className="text-white/75 font-medium">$149/month. No contracts. Live in 48 hours.</span>
          </p>

          {/* Channel equation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { icon: Mic, label: "Voice Bot", color: "from-violet-500/15 to-violet-500/5 border-violet-500/20 text-violet-300" },
              { icon: MessageCircle, label: "SMS & WhatsApp Bot", color: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-300" },
              { icon: FileText, label: "Web Form", color: "from-blue-500/15 to-blue-500/5 border-blue-500/20 text-blue-300" },
            ].map((item, i) => (
              <>
                <div key={item.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-gradient-to-br ${item.color} text-sm font-medium backdrop-blur-sm`}>
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </div>
                {i < 2 && <span key={`plus-${i}`} className="text-white/20 text-base font-light">+</span>}
              </>
            ))}
            <span className="text-white/20 text-base font-light">=</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.06] text-white text-sm font-semibold">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              One Dashboard
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-400 hover:to-violet-500 transition-all duration-200 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0">
                <CreditCard className="w-4 h-4" />
                Start for $149/month
              </button>
            </a>
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-medium border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200">
                <Calendar className="w-4 h-4" />
                Schedule a Free Demo
              </button>
            </a>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
            {["No setup fees", "No long-term contracts", "Cancel anytime", "Full setup included", "Live in 48 hours"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500/70 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ───────────────────────────────────────────────── */}
      <section className="py-20 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              { stat: "68%", label: "of customers leave because they feel ignored after submitting a support request", icon: Clock },
              { stat: "43%", label: "of customers prefer to call for support — but most ticket systems don't handle calls at all", icon: Phone },
              { stat: "3×", label: "faster resolution when customers can choose their preferred intake channel", icon: TrendingUp },
            ].map((item) => (
              <div key={item.stat} className="bg-[#0d1117] p-8 md:p-10">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/10 border border-white/[0.06] flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{item.stat}</div>
                <p className="text-sm text-white/40 leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE CHANNELS ──────────────────────────────────────────────────── */}
      <section id="channels" className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
              Three intake channels
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              Meet your customers<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">wherever they are</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Every channel feeds the same dashboard. Your team works one queue — not three inboxes.
            </p>
          </div>

          {/* Voice Bot */}
          <div className="group relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d1117] to-[#0a0d15] p-8 md:p-12 mb-5 overflow-hidden hover:border-violet-500/25 transition-all duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/6 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/10 transition-all duration-500" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-5">
                  <Mic className="w-3 h-3" />
                  Voice Bot
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Your customer calls.<br />The AI answers.
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  When a customer calls your support number, an AI voice bot picks up instantly — 24/7, no hold music, no missed calls. It collects their name, issue, and product, then creates a ticket automatically and texts them their ticket number.
                </p>
                <ul className="space-y-2.5">
                  {["Answers calls 24/7 — even holidays and weekends", "Asks smart follow-up questions to capture full context", "Auto-creates ticket and sends SMS confirmation to caller", "Powered by GHL Voice AI — no extra software needed"].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-white/50">
                      <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-violet-500/15 to-violet-900/10 border border-violet-500/15 flex items-center justify-center">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                      <Mic className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-ping" style={{ animationDuration: "3s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Bot */}
          <div className="group relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d1117] to-[#0a0d15] p-8 md:p-12 mb-5 overflow-hidden hover:border-emerald-500/25 transition-all duration-500">
            <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-600/8 transition-all duration-500" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-5">
                  <MessageCircle className="w-3 h-3" />
                  SMS & WhatsApp Bot
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Your customer texts.<br />The bot handles it.
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  A customer texts your number with a problem. The GHL chatbot replies instantly, asks a few quick questions, and creates a support ticket — all without any human involvement. The customer gets a ticket number via text and feels taken care of immediately.
                </p>
                <ul className="space-y-2.5">
                  {["Works on SMS and WhatsApp — no app download required", "Conversational flow guides customer to the right team", "Ticket created and confirmed in under 60 seconds", "Powered by GHL Conversation AI"].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-white/50">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:order-1 flex items-center justify-center">
                <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-emerald-500/15 to-emerald-900/10 border border-emerald-500/15 flex items-center justify-center">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                      <MessageCircle className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: "3.5s" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Web Form */}
          <div className="group relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d1117] to-[#0a0d15] p-8 md:p-12 overflow-hidden hover:border-blue-500/25 transition-all duration-500">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/8 transition-all duration-500" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-5">
                  <FileText className="w-3 h-3" />
                  Web Form
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Your customer visits your site.<br />Done in 60 seconds.
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  Your branded portal lets customers submit a detailed ticket from any device. They choose their product, describe the issue, set priority, and attach a screenshot or Loom video. A ticket number is generated instantly and they can check status anytime — no login required.
                </p>
                <ul className="space-y-2.5">
                  {["Branded with your logo and company name", "Custom product/service dropdown for your business", "Screenshot and Loom video attachment support", "Real-time status lookup by ticket number — no account needed"].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-white/50">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/15 to-blue-900/10 border border-blue-500/15 flex items-center justify-center">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                      <FileText className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: "4s" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-24 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
              How it works
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Live in 48 hours.<br />
              <span className="text-white/40">Zero technical work on your end.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "We set everything up for you", desc: "After payment, we schedule a 30-minute onboarding call. We configure your portal, voice bot, chat bot, and GHL automations — you don't touch a thing." },
              { step: "02", title: "Your customers reach you any way they want", desc: "They can call, text, WhatsApp, or fill out your web form. Every channel creates a ticket automatically and sends them a confirmation." },
              { step: "03", title: "Your team resolves issues from one dashboard", desc: "All tickets — regardless of channel — land in one clean admin panel. Every status change triggers an automatic update to the customer." },
            ].map((s) => (
              <div key={s.step} className="relative p-7 rounded-2xl border border-white/[0.07] bg-[#0d1117]">
                <div className="text-5xl font-black text-white/[0.04] mb-4 leading-none select-none">{s.step}</div>
                <h3 className="font-semibold text-white mb-2 text-base">{s.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
              Platform features
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Everything your team needs.<br />
              <span className="text-white/40">Nothing they don't.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: "Omnichannel Notifications", desc: "Every ticket update triggers automated Email, SMS, and WhatsApp messages to your customers — powered by GoHighLevel.", color: "text-blue-400", bg: "from-blue-500/10 to-blue-500/5 border-blue-500/15" },
              { icon: Bot, title: "AI-Powered First Response", desc: "Your AI bot acknowledges every ticket instantly, 24/7 — so customers never feel ignored, even at 2 AM.", color: "text-violet-400", bg: "from-violet-500/10 to-violet-500/5 border-violet-500/15" },
              { icon: Users, title: "Team Assignment & Notes", desc: "Assign tickets to specific staff, leave internal notes, and track every action with a full activity log.", color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15" },
              { icon: BarChart3, title: "Reporting & Analytics", desc: "Monthly volume, completion rates, and average time-to-resolve — know exactly how your support team is performing.", color: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5 border-amber-500/15" },
              { icon: Globe, title: "Your Own Branded Portal", desc: "Each client gets their own subdomain with their logo and custom service menu — looks like it was built just for them.", color: "text-cyan-400", bg: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/15" },
              { icon: Shield, title: "Fully Managed & Supported", desc: "We set everything up, configure your automations, and monitor your system. If something breaks, we fix it.", color: "text-rose-400", bg: "from-rose-500/10 to-rose-500/5 border-rose-500/15" },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-white/[0.06] bg-[#0d1117] hover:border-white/[0.12] transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.bg} border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ────────────────────────────────────────────────── */}
      <section className="py-24 border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Your competitors only offer a form.
            </h2>
            <p className="text-white/40 text-lg">You offer three ways to get help.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <div className="grid grid-cols-3 bg-[#0d1117] border-b border-white/[0.07]">
              <div className="p-5 text-sm font-semibold text-white/40">Feature</div>
              <div className="p-5 text-sm font-semibold text-white/40 border-l border-white/[0.07]">Typical Tools</div>
              <div className="p-5 text-sm font-semibold text-white border-l border-white/[0.07] bg-gradient-to-r from-blue-500/8 to-violet-500/8">
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">AIA SupportDesk</span>
              </div>
            </div>
            {[
              ["Web form intake", true, true],
              ["Email notifications", true, true],
              ["SMS notifications", false, true],
              ["WhatsApp notifications", false, true],
              ["Voice bot intake (calls)", false, true],
              ["SMS/Chat bot intake (texts)", false, true],
              ["GHL workflow integration", false, true],
              ["Fully set up for you", false, true],
              ["Price", "$150–500+/mo", "$149/mo"],
            ].map(([feat, them, us]) => (
              <div key={String(feat)} className="grid grid-cols-3 border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                <div className="p-4 text-sm text-white/50">{feat}</div>
                <div className="p-4 border-l border-white/[0.05] flex items-center">
                  {typeof them === "boolean" ? (
                    them ? <CheckCircle className="w-4 h-4 text-white/30" /> : <span className="w-4 h-4 rounded-full border border-white/10 inline-block" />
                  ) : <span className="text-sm text-white/30">{them}</span>}
                </div>
                <div className="p-4 border-l border-white/[0.05] flex items-center bg-gradient-to-r from-blue-500/4 to-violet-500/4">
                  {typeof us === "boolean" ? (
                    us ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-white/10 inline-block" />
                  ) : <span className="text-sm font-semibold text-emerald-400">{us}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-semibold tracking-widest uppercase mb-5">
              Simple pricing
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              One plan. Everything included.
            </h2>
            <p className="text-white/40 text-lg">
              Voice bot, chat bot, web form, automations, reporting, and full setup — one flat monthly fee.
            </p>
          </div>

          <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0d1117] to-[#0a0d15] p-10 md:p-14 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-7xl font-black text-white tracking-tighter">$149</span>
                    <span className="text-white/30 text-xl">/month</span>
                  </div>
                  <p className="text-white/30 text-sm mb-8">Per workspace · Unlimited staff · Cancel anytime</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {included.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/50">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 md:min-w-[220px]">
                  <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-400 hover:to-violet-500 transition-all duration-200 shadow-2xl shadow-blue-500/20">
                      <CreditCard className="w-4 h-4" />
                      Get Started Now
                    </button>
                  </a>
                  <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-medium border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200">
                      <Calendar className="w-4 h-4" />
                      Book a Free Demo First
                    </button>
                  </a>
                  <p className="text-xs text-white/20 text-center pt-1">No setup fees · No contracts · Cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────────────────────── */}
      <section className="py-24 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Built for businesses that take support seriously
            </h2>
            <p className="text-white/35">Everything your customers expect. Everything your team needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Our customers used to email us and wonder if anyone saw it. Now they get a text confirmation in seconds — whether they called, texted, or filled out the form.", name: "Agency Owner", role: "GoHighLevel Partner" },
              { quote: "Setup was done in one call. Voice bot, chat bot, web portal — all live the next morning. I didn't have to configure a single thing.", name: "SaaS Founder", role: "Software Company" },
              { quote: "The voice bot alone was worth it. Customers who used to leave voicemails now get a ticket number immediately. The difference in trust is night and day.", name: "Operations Manager", role: "Service Business" },
            ].map((t) => (
              <div key={t.name} className="p-7 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:border-white/[0.12] transition-all duration-300">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/45 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-white/25 mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-px rounded-2xl overflow-hidden border border-white/[0.07]">
            {faqs.map((faq, i) => (
              <div key={faq.q} className={`p-7 bg-[#0d1117] ${i > 0 ? "border-t border-white/[0.05]" : ""} hover:bg-[#0f1420] transition-colors duration-200`}>
                <h3 className="font-semibold text-white mb-2.5 text-sm">{faq.q}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-violet-600/6 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[{ icon: Mic, label: "Voice" }, { icon: MessageCircle, label: "Chat" }, { icon: FileText, label: "Form" }].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/40 text-xs font-medium">
                <item.icon className="w-3 h-3" />
                {item.label}
              </div>
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
            Ready to give your customers<br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">the support they deserve?</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
            Voice bot, chat bot, and web form — all set up for you in 48 hours. $149/month. No contracts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2.5 px-10 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-400 hover:to-violet-500 transition-all duration-200 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0">
                <CreditCard className="w-4 h-4" />
                Start for $149/month
              </button>
            </a>
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2.5 px-10 py-4 rounded-xl text-base font-medium border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200">
                <Calendar className="w-4 h-4" />
                Book a Free Demo
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#080c14]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <HeadphonesIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white/70 text-sm">AIA SupportDesk</span>
          </div>
          <p className="text-xs text-white/20 text-center">
            $149/month · No contracts · Cancel anytime · Full setup included
          </p>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <a href="/submit" className="hover:text-white/60 transition-colors">Submit a Ticket</a>
            <a href="/check-status" className="hover:text-white/60 transition-colors">Check Status</a>
            <a href="/login" className="hover:text-white/60 transition-colors">Staff Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
