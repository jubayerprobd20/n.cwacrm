"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  RefreshCw, 
  HelpCircle, 
  Code, 
  Link2, 
  Smartphone, 
  CheckSquare, 
  FileText, 
  Lock, 
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";

export default function FeaturesPage() {
  const featureList = [
    {
      icon: Users,
      title: "Contact & Segment Management",
      description: "Know exactly who your customers are. Tag, segment, and filter contacts by behavior, campaign, or attribute — then reach the right people with the right message at the right time.",
      color: "text-emerald-400 font-bold",
      accent: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: RefreshCw,
      title: "Drip Campaigns",
      description: "Set it once, sell forever. Automated sequences nurture leads, re-engage dormant contacts, and deliver your pitch — on schedule, without your team lifting a finger.",
      color: "text-teal-400 font-bold",
      accent: "from-teal-500/20 to-cyan-500/20"
    },
    {
      icon: HelpCircle,
      title: "FAQ Bot",
      description: "Answer your most common questions before your team even sees them. Configure question-answer pairs once — the bot handles them around the clock, automatically.",
      color: "text-emerald-400 font-bold",
      accent: "from-emerald-400/20 to-green-500/20"
    },
    {
      icon: Code,
      title: "API & Webhooks",
      description: "Send WhatsApp messages directly from your server, CRM, or any low-code platform. Full API access, webhook configuration, and developer docs — connect anything that speaks HTTP.",
      color: "text-pink-400 font-bold",
      accent: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: Link2,
      title: "Extensible Integrations",
      description: "Use webhooks and the public REST API to connect your existing systems. Bangladesh-specific payment, ERP, and commerce connections are scoped and configured for your business.",
      color: "text-teal-400 font-bold",
      accent: "from-teal-400/20 to-indigo-500/20"
    },
    {
      icon: Smartphone,
      title: "Campaign Automation",
      description: "Segment contacts, schedule approved WhatsApp templates, and trigger follow-up flows from customer activity.",
      color: "text-emerald-400 font-bold",
      accent: "from-emerald-500/20 to-green-400/20"
    },
    {
      icon: CheckSquare,
      title: "Projects & Tasks",
      description: "Stay organized without switching tools. Create, assign, and track follow-up tasks inside the dashboard — so nothing slips, no matter how fast your business moves.",
      color: "text-amber-400 font-bold",
      accent: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: FileText,
      title: "Rich Media Support",
      description: "Professional conversations don't have to be plain text. Send images, videos, documents, and product catalogs. Keep every message engaging and on-brand.",
      color: "text-red-400 font-bold",
      accent: "from-red-500/20 to-rose-400/20"
    },
    {
      icon: Lock,
      title: "Role-Based Access Control",
      description: "Give your team the right access — nothing more. Assign roles and permissions so every member sees what they need, and sensitive data stays protected.",
      color: "text-emerald-400 font-bold",
      accent: "from-emerald-500/20 to-cyan-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Background glow sparks */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        {/* Header Hero */}
        <section className="relative w-full py-12 px-4 md:px-6 max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Capabilities & Features
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
            Everything you need to <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              automate WhatsApp
            </span>
          </h1>
          <p className="text-sm sm:text-base max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            Unleash the full potential of customer engagement, automation, and analytics. Link and operate your official WhatsApp automation setup in minutes.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="px-4 md:px-6 max-w-7xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {featureList.map((item, idx) => (
              <Card 
                key={idx}
                className="relative rounded-2xl border border-neutral-900 bg-neutral-950/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-neutral-800 hover:bg-neutral-950/70 shadow-lg group flex flex-col justify-between"
              >
                {/* Decorative hover gradient card bg */}
                <div className={`absolute inset-0 z-0 bg-gradient-to-tr ${item.accent} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardHeader className="p-7 relative z-10">
                  <div className="mb-4 w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    <item.icon className={`w-5.5 h-5.5 ${item.color}`} />
                  </div>
                  <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-3 text-muted-foreground leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 border-t border-b border-neutral-900 bg-neutral-950/20 relative mt-24">
          <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-16 text-center">
            <div className="space-y-4 max-w-3xl mx-auto">
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary px-3.5 py-1">
                Process
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                How it works
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Getting started with N.C WaCRM takes minutes, not months.
              </p>
            </div>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-left">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50 -z-10" />
              
              {/* Step 1 */}
              <div className="flex flex-col items-start space-y-5">
                <div className="w-10 h-10 rounded-lg border border-emerald-500/30 bg-neutral-950 flex items-center justify-center text-xs font-semibold text-emerald-400 shadow-md">
                  01
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Connect and Configure — No Developer Needed
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Link your WhatsApp number, define your chatbot flows, and set your automation rules — all through a simple visual builder. Most businesses are live within a single afternoon.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-start space-y-5">
                <div className="w-10 h-10 rounded-lg border border-teal-500/30 bg-neutral-950 flex items-center justify-center text-xs font-semibold text-teal-400 shadow-md">
                  02
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white leading-snug">
                    Your Business Runs. Conversations Run on Autopilot.
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Leads get instant replies. Customers get follow-ups. Automated messaging reaches your list instantly. All of it runs in the background while you focus on actually growing.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-start space-y-5">
                <div className="w-10 h-10 rounded-lg border border-cyan-500/30 bg-neutral-950 flex items-center justify-center text-xs font-semibold text-cyan-400 shadow-md">
                  03
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white leading-snug">
                    See Exactly What&apos;s Making You Money
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Real-time dashboards show open rates, reply rates, conversions, and drop-offs. Know what&apos;s working. Double down on it. Kill what isn&apos;t. Every week gets better than the last.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meta Business Integration Section */}
        <section className="py-24 border-b border-neutral-900 bg-neutral-950/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <Badge variant="outline" className="bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981] px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
                  🟢 Official Meta Partner
                </Badge>
                
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Meta Business <br /> Integration
                </h2>
                
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block font-mono">
                  Built on the Official WhatsApp Business API
                </span>
                
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  N.C WaCRM connects to the official WhatsApp Business API through Meta Business. Every message you send — automated chatbot replies, customer updates, and notifications — is delivered with enterprise-grade reliability and full Meta compliance. No workarounds. No grey-area tools.
                </p>
                
                <div className="pt-2">
                  <Link href="/pricing">
                    <Button size="lg" className="px-8 py-6 h-auto text-base font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 gap-2 rounded-xl">
                      View Pricing
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right Column (4 Cards) */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-5 text-left space-y-3 shadow-lg hover:border-neutral-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-center text-primary">
                    <Link2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Official WhatsApp Business API</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Direct connection through Meta Business — enterprise-grade delivery, full compliance, and 99.9% message reliability. Your messages arrive, every time.
                  </p>
                </div>
                
                {/* Card 2 */}
                <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-5 text-left space-y-3 shadow-lg hover:border-neutral-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-center text-primary">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Click-to-WhatsApp Ads</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Your Facebook and Instagram ads drop leads straight into a WhatsApp conversation — with an automated reply waiting before they even finish reading your ad.
                  </p>
                </div>
                
                {/* Card 3 */}
                <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-5 text-left space-y-3 shadow-lg hover:border-neutral-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-850 flex items-center justify-center text-primary">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Build Chatbots Without Code</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    Launch sales bots, support bots, and lead qualification flows in minutes — with a drag-and-drop builder that requires zero developer involvement.
                  </p>
                </div>
                
                {/* Card 4 */}
                <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-5 text-left space-y-3 shadow-lg hover:border-neutral-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#080a0e] border border-neutral-850 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4 text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                  </div>
                  <h4 className="text-sm font-bold text-white">Real-Time Campaign Analytics</h4>
                  <p className="text-xs text-muted-foreground leading-normal">
                    See exactly what&apos;s driving revenue. Track delivered, read, replied, and conversion rates live — and retarget warm leads before they cool off.
                  </p>
                </div>
              </div>
              
            </div>
            
            {/* Centered partner tag at bottom */}
            <div className="text-center pt-10 text-[10px] text-slate-600 font-bold uppercase tracking-widest select-none">
              Official Meta Business Partner
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="px-4 md:px-6 max-w-6xl mx-auto mt-24">
          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-900 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                Official API Solutions
              </Badge>
              <h2 className="text-2xl sm:text-3.5xl font-black text-white leading-tight">
                Built on the official WhatsApp Business Platform
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect your business phone number securely via official Meta APIs. Direct delivery, compliant protocols, and absolute security for your customer communication operations.
              </p>
              <div className="pt-4">
                <a href="/login" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-sm gap-2">
                  Get Started Now
                  <Zap className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
