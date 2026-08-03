import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp,
  Phone,
  FileText,
  Mic,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

// ── CONFIG ─────────────────────────────────────────────────────────────────────
const DEMO_CALENDAR_URL = "https://api.leadconnectorhq.com/widget/bookings/jimmys-master-calendar";
const STRIPE_PAYMENT_URL = "https://buy.stripe.com/YOUR_LINK";
// ───────────────────────────────────────────────────────────────────────────────

const channels = [
  {
    icon: Mic,
    badge: "Voice Bot",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accentColor: "border-violet-200 hover:border-violet-400",
    title: "Your customer calls. The AI answers.",
    subtitle: "24/7 voice intake — no hold music, no missed calls",
    description:
      "When a customer calls your support number, an AI voice bot picks up instantly. It collects their name, issue, and product — then creates a ticket automatically and texts them their ticket number. Your team wakes up to organized, categorized tickets. Not a voicemail inbox.",
    bullets: [
      "Answers calls 24/7 — even holidays and weekends",
      "Asks smart follow-up questions to capture full context",
      "Auto-creates ticket and sends SMS confirmation to caller",
      "Powered by GHL Voice AI — no extra software needed",
    ],
    tag: "Powered by GHL Voice AI",
  },
  {
    icon: MessageCircle,
    badge: "Chat Bot",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accentColor: "border-emerald-200 hover:border-emerald-400",
    title: "Your customer texts. The bot handles it.",
    subtitle: "SMS & WhatsApp intake — meets customers where they are",
    description:
      "A customer texts your number with a problem. The GHL chatbot replies instantly, asks a few quick questions, and creates a support ticket — all without any human involvement. The customer gets a ticket number via text and feels taken care of immediately.",
    bullets: [
      "Works on SMS and WhatsApp — no app download required",
      "Conversational flow guides customer to the right team",
      "Ticket created and confirmed in under 60 seconds",
      "Powered by GHL Conversation AI",
    ],
    tag: "Powered by GHL Conversation AI",
  },
  {
    icon: FileText,
    badge: "Web Form",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accentColor: "border-blue-200 hover:border-blue-400",
    title: "Your customer visits your site. Done in 60 seconds.",
    subtitle: "Branded web portal — the classic channel, done right",
    description:
      "Your branded portal lets customers submit a detailed ticket from any device. They choose their product, describe the issue, set priority, and attach a screenshot or Loom video. A ticket number is generated instantly and they can check status anytime — no login required.",
    bullets: [
      "Branded with your logo and company name",
      "Custom product/service dropdown for your business",
      "Screenshot and Loom video attachment support",
      "Real-time status lookup by ticket number — no account needed",
    ],
    tag: "Fully branded & customizable",
  },
];

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
      "Each client gets their own subdomain with their logo and custom service menu — looks like it was built just for them.",
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
    desc: "After payment, we schedule a 30-minute onboarding call. We configure your portal, voice bot, chat bot, and GHL automations — you don't touch a thing.",
  },
  {
    step: "02",
    title: "Your customers reach you any way they want",
    desc: "They can call, text, WhatsApp, or fill out your web form. Every channel creates a ticket automatically and sends them a confirmation.",
  },
  {
    step: "03",
    title: "Your team resolves issues from one dashboard",
    desc: "All tickets — regardless of channel — land in one clean admin panel. Every status change triggers an automatic update to the customer.",
  },
];

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
    <div className="min-h-screen bg-white text-foreground">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">AIA SupportDesk</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#channels" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Book a Demo</span>
                <span className="sm:hidden">Demo</span>
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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-12 sm:pb-20 text-center overflow-hidden">
          <Badge variant="secondary" className="mb-5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-primary/8 text-primary border-primary/20 max-w-full text-center">
            The only support system built for GHL agencies
          </Badge>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-semibold text-slate-900 leading-[1.08] mb-5 text-balance max-w-4xl mx-auto">
            Voice. Chat. Form.<br />
            <span className="text-primary italic">Every customer, every channel.</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-500 leading-relaxed mb-6 max-w-2xl mx-auto">
            Your customers can call, text, WhatsApp, or fill out a form — and every single one creates a support ticket automatically.
            <strong className="text-slate-700"> $149/month. No contracts. Fully set up for you in 48 hours.</strong>
          </p>

          {/* Channel pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium">
              <Mic className="w-3.5 h-3.5" />
              Voice Bot
            </div>
            <div className="text-slate-300 text-lg">+</div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <MessageCircle className="w-3.5 h-3.5" />
              SMS & WhatsApp Bot
            </div>
            <div className="text-slate-300 text-lg">+</div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
              <FileText className="w-3.5 h-3.5" />
              Web Form
            </div>
            <div className="text-slate-300 text-lg">=</div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              One Dashboard
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a href={STRIPE_PAYMENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <CreditCard className="w-4 h-4" />
                Start for $149/month
              </Button>
            </a>
            <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-14 text-sm sm:text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                <Calendar className="w-4 h-4" />
                Schedule a Free Demo
              </Button>
            </a>
          </div>
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
      <section className="bg-slate-900 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6 leading-tight">
            Your competitors only offer a form.<br />
            <span className="text-slate-400">You offer three ways to get help.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Most support systems make customers come to them. AIA SupportDesk meets customers wherever they are — on the phone, in a text, or on your website — and handles intake automatically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: Clock, stat: "68%", label: "of customers leave because they feel unappreciated or ignored after submitting a request" },
              { icon: Phone, stat: "43%", label: "of customers prefer to call for support — but most ticket systems don't handle calls at all" },
              { icon: TrendingUp, stat: "5×", label: "more likely to retain a customer when you communicate proactively across their preferred channel" },
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

      {/* ── THREE CHANNELS ──────────────────────────────────────────────────── */}
      <section id="channels" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/8 text-primary border-primary/20">
              Three intake channels
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-slate-900 mb-5 leading-tight">
              Meet your customers<br />wherever they are
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Every channel feeds into the same dashboard. Your team works one queue — no matter how the customer reached out.
            </p>
          </div>

          <div className="flex flex-col gap-16">
            {channels.map((ch, i) => (
              <div
                key={ch.badge}
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-10 items-center`}
              >
                {/* Visual card */}
                <div className={`flex-1 rounded-3xl border-2 ${ch.accentColor} p-10 transition-all duration-300 bg-white shadow-sm`}>
                  <div className={`w-14 h-14 rounded-2xl ${ch.iconBg} flex items-center justify-center mb-6`}>
                    <ch.icon className={`w-7 h-7 ${ch.iconColor}`} />
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${ch.badgeColor}`}>
                    {ch.badge}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-slate-900 mb-2 leading-snug">
                    {ch.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-5 font-medium">{ch.subtitle}</p>
                  <p className="text-slate-600 leading-relaxed mb-7">{ch.description}</p>
                  <ul className="space-y-2.5">
                    {ch.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">{ch.tag}</span>
                  </div>
                </div>

                {/* Text side */}
                <div className="flex-1 flex flex-col justify-center gap-5">
                  <div className="text-7xl font-bold text-slate-100 leading-none select-none">
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">
                      {i === 0 && "No more missed calls or voicemail chaos"}
                      {i === 1 && "No more 'did you get my text?' messages"}
                      {i === 2 && "No more lost emails or forgotten requests"}
                    </h4>
                    <p className="text-slate-500 leading-relaxed">
                      {i === 0 && "Every call is answered, every issue is captured, and every caller gets a ticket number — automatically. Your team starts the day with a clean, organized queue instead of a missed call list."}
                      {i === 1 && "Customers who prefer texting get the same professional experience as those who fill out a form. The bot handles the conversation, your team handles the resolution."}
                      {i === 2 && "Your branded web portal gives customers a professional, structured way to submit detailed issues — with attachments, priority levels, and instant ticket confirmation."}
                    </p>
                  </div>
                  <a href={DEMO_CALENDAR_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-2.5 transition-all">
                    See it in action <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON CALLOUT ──────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-lg">How AIA SupportDesk compares</h3>
              <p className="text-slate-500 text-sm mt-1">vs. typical support ticket tools</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-8 py-4 text-slate-500 font-medium">Feature</th>
                    <th className="px-6 py-4 text-slate-400 font-medium text-center">Typical tools</th>
                    <th className="px-6 py-4 text-primary font-semibold text-center bg-primary/4">AIA SupportDesk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    ["Web form intake", true, true],
                    ["Email notifications", true, true],
                    ["SMS notifications", false, true],
                    ["WhatsApp notifications", false, true],
                    ["Voice bot (inbound calls)", false, true],
                    ["SMS / WhatsApp chatbot intake", false, true],
                    ["GHL workflow integration", false, true],
                    ["Fully set up for you", false, true],
                    ["All-inclusive pricing", false, true],
                  ].map(([label, them, us]) => (
                    <tr key={label as string}>
                      <td className="px-8 py-3.5 text-slate-700 font-medium">{label as string}</td>
                      <td className="px-6 py-3.5 text-center">
                        {them ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-slate-300 text-lg leading-none">✕</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center bg-primary/4">
                        {us ? (
                          <CheckCircle className="w-4 h-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-slate-300 text-lg leading-none">✕</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              We handle every detail of setup — voice bot, chat bot, web portal, and GHL automations. You focus on your customers.
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
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Voice bot, chat bot, web form, automations, reporting, and full setup — all for one flat monthly fee.
            </p>
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
                quote: "Our customers used to email us and wonder if anyone saw it. Now they get a text confirmation in seconds — whether they called, texted, or filled out the form.",
                name: "Agency Owner",
                role: "GoHighLevel Partner",
              },
              {
                quote: "Setup was done in one call. Voice bot, chat bot, web portal — all live the next morning. I didn't have to configure a single thing.",
                name: "SaaS Founder",
                role: "Software Company",
              },
              {
                quote: "The voice bot alone was worth it. Customers who used to leave voicemails now get a ticket number immediately. The difference in trust is night and day.",
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
              <Mic className="w-3 h-3" /> Voice
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
              <MessageCircle className="w-3 h-3" /> Chat
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
              <FileText className="w-3 h-3" /> Form
            </div>
          </div>
          <h2 className="font-display text-4xl font-semibold text-primary-foreground mb-5 leading-tight">
            Ready to give your customers<br />the support they deserve?
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            Voice bot, chat bot, and web form — all set up for you in 48 hours.
            $149/month. No contracts.
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
