"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Shield, Users } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Background glow overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        {/* Hero Header */}
        <section className="max-w-4xl mx-auto px-4 md:px-6 py-12 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Our Vision
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white">
            About N.C WaCRM OS
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            N.C WaCRM is an AI-powered WhatsApp CRM and customer-support automation platform built for Bangladesh businesses and agencies that need trusted, responsive customer communication.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-8 space-y-4 hover:border-neutral-800 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Target className="w-5.5 h-5.5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Our Mission</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We empower modern enterprises to streamline client conversations, automate support using official Meta Cloud APIs, and run targeted campaigns without risking number suspensions.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-8 space-y-4 hover:border-neutral-800 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Shield className="w-5.5 h-5.5 text-teal-400" />
            </div>
            <h3 className="text-base font-bold text-white">Compliance First</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              N.C WaCRM uses Meta's official WhatsApp Business platform APIs. It does not rely on browser automation or scraping; your team remains responsible for meeting Meta's policies and approval requirements.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-8 space-y-4 hover:border-neutral-800 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Users className="w-5.5 h-5.5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Agency White-Label</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Designed with a modular multi-tenant architecture, N.C WaCRM gives digital agencies branding and client-workspace controls. Domain and payment-provider integrations are delivered through a separate implementation scope.
            </p>
          </div>
        </section>

        {/* Narrative / Context Section */}
        <section className="max-w-4xl mx-auto px-4 md:px-6 mt-24">
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950/20 p-8 sm:p-12 space-y-6">
            <h2 className="text-2xl font-bold text-white">The WhatsApp Business OS</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Customer support shouldn't exist in a silo. We built N.C WaCRM to combine team collaboration, automated FAQ answering chatbots, contact segmenting, and external business operations (such as payment processing and school alerts) in a unified workspace.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We continue to expand our features list, adding new native API integrations and visual builder modules, with standard updates shipped directly to our customer workspaces every week.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
