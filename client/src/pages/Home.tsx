import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, HeadphonesIcon, Search, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">SupportDesk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/check-status">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Check Status
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="sm" className="gap-1.5">
                Submit Ticket
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-6 text-xs font-medium tracking-wide uppercase">
            Customer Support
          </Badge>
          <h1 className="font-display text-5xl font-medium text-foreground leading-[1.1] mb-6 text-balance">
            We're here to help<br />
            <span className="text-primary">resolve your issues</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
            Submit a support ticket and our dedicated team will respond promptly. Track your issue every step of the way with real-time status updates.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/submit">
              <Button size="lg" className="gap-2 px-8 h-12 text-base">
                Submit a Ticket
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/check-status">
              <Button variant="outline" size="lg" className="gap-2 px-8 h-12 text-base bg-white">
                <Search className="w-4 h-4" />
                Check Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Fast Response",
                description: "Our support team reviews every ticket promptly and keeps you informed throughout the process.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your information is handled with care. Internal notes and team discussions are never visible to you.",
              },
              {
                icon: Clock,
                title: "Real-time Tracking",
                description: "Enter your ticket number at any time to see the current status and latest updates on your issue.",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-medium text-foreground mb-3">How it works</h2>
          <p className="text-muted-foreground">Three simple steps to get your issue resolved</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Submit your ticket", desc: "Fill out the form with details about your issue. Attach images or a Loom video for context." },
            { step: "02", title: "Get a ticket number", desc: "Receive a unique ticket number instantly. Our team is notified and begins reviewing your case." },
            { step: "03", title: "Track your progress", desc: "Use your ticket number to check status updates anytime until your issue is fully resolved." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-medium text-primary-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Submit your first ticket and experience responsive, professional support.
          </p>
          <Link href="/submit">
            <Button size="lg" variant="secondary" className="gap-2 px-8 h-12 text-base">
              Submit a Ticket
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <HeadphonesIcon className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">SupportDesk</span>
          </div>
          <p className="text-xs text-muted-foreground">Professional support, every step of the way.</p>
        </div>
      </footer>
    </div>
  );
}
