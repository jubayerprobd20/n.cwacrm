"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, X } from "lucide-react";
import { Fragment } from "react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      tagline: "Full control. You run it.",
      price: "৳2,999",
      period: "/month",
      setup: "No setup fee",
      cta: "Get Started",
      onboarding: "Set up your workspace and connect one WhatsApp Business number.",
      recommended: false,
      details: "Perfect for tech-savvy business owners who want to handle the configuration themselves.",
      features: [
        "1 WhatsApp Business number",
        "Contact usage dashboard",
        "Shared team inbox",
        "Basic automations",
        "Broadcast Templates Scheduler",
        "Self-service setup documentation"
      ]
    },
    {
      name: "Growth",
      tagline: "We launch you. You own it.",
      price: "৳9,999",
      period: "for first month",
      setup: "৳2,999/month after the first month",
      cta: "Book a Call",
      onboarding: "Assisted onboarding and workspace configuration.",
      recommended: true,
      details: "Our team takes care of setting up your channels and workflows so you can start right away.",
      features: [
        "One WhatsApp Business number",
        "10,000-contact usage plan",
        "Shared team inbox",
        "No-Code Chatbot Flow Builder",
        "AI Reply Assistant (BYO Key)",
        "Webhooks & public API access",
        "Assisted setup"
      ]
    },
    {
      name: "Managed",
      tagline: "We run it. You check results.",
      price: "৳29,999",
      period: "for first month",
      setup: "৳2,999/month after the first month",
      cta: "Book a Call",
      onboarding: "Custom onboarding scope is agreed before work begins.",
      recommended: false,
      details: "Fully outsourced operations, custom chatbot prompt programming, and a dedicated manager.",
      features: [
        "High-volume contact plan",
        "Advanced automation configuration",
        "AI assistant workspace setup",
        "Reseller workspace controls",
        "Branding settings",
        "Custom implementation scope",
        "Dedicated onboarding"
      ]
    }
  ];

  const matrix = [
    {
      category: "The Platform",
      features: [
        { name: "No-Code Automation Builder", starter: "yes", growth: "yes", managed: "yes" },
        { name: "AI Assistant (trained on your docs)", starter: "DIY", growth: "DIY", managed: "We configure it" },
        { name: "Shared Team Inbox", starter: "yes", growth: "yes", managed: "yes" },
        { name: "Webhooks & public API", starter: "yes", growth: "yes", managed: "yes" },
        { name: "Meta conversation charges", starter: "separate", growth: "separate", managed: "separate" },
        { name: "WhatsApp Business API connection", starter: "DIY", growth: "assisted", managed: "assisted" }
      ]
    },
    {
      category: "Setup & Onboarding",
      features: [
        { name: "Meta Business Verification help", starter: "DIY", growth: "DIY", managed: "yes" },
        { name: "WhatsApp Number Connection", starter: "DIY", growth: "yes", managed: "yes" },
        { name: "WhatsApp Business setup", starter: "DIY", growth: "yes", managed: "yes" },
        { name: "Platform Config & Team Access", starter: "DIY", growth: "yes", managed: "yes" },
        { name: "Kickoff Meeting", starter: "DIY", growth: "yes", managed: "yes" },
        { name: "Automations Built For You", starter: "DIY", growth: "DIY", managed: "2–3 core automations" },
        { name: "Message Templates Written & Submitted", starter: "DIY", growth: "DIY", managed: "yes" },
        { name: "Custom implementation scope", starter: "DIY", growth: "DIY", managed: "on request" }
      ]
    },
    {
      category: "Support & Strategy",
      features: [
        { name: "Support channel", starter: "standard", growth: "priority", managed: "dedicated" },
        { name: "Monthly product guidance", starter: "yes", growth: "yes", managed: "yes" },
        { name: "1-on-1 Strategy Call", starter: "DIY", growth: "Onboarding call included", managed: "Monthly deep-dive (60 min)" },
        { name: "Dedicated Account Manager", starter: "DIY", growth: "DIY", managed: "yes" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Background glow overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        {/* Page title */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Pricing Plans
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none max-w-3xl mx-auto">
            One platform. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Three ways to get started.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transparent BDT pricing for Bangladesh businesses. Meta/WhatsApp conversation charges and applicable taxes are billed separately.
          </p>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`relative flex flex-col justify-between border bg-[#0d0f16]/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 !overflow-visible ${
                  plan.recommended
                    ? "border-emerald-500/50 shadow-2xl shadow-emerald-500/5"
                    : "border-neutral-900"
                }`}
              >
                {plan.recommended && (
                  <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase px-3 py-1 whitespace-nowrap">
                    Most Popular
                  </Badge>
                )}

                <div>
                  <CardHeader className="p-7 border-b border-neutral-900/60">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                      {plan.name}
                    </span>
                    <CardTitle className="text-base text-white mt-1.5 font-bold">
                      {plan.tagline}
                    </CardTitle>
                    <div className="mt-5 flex items-baseline gap-1 py-2 border-y border-neutral-900/50">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                    <div className="text-xs font-medium text-emerald-400 mt-2.5">
                      {plan.setup}
                    </div>
                  </CardHeader>

                  <CardContent className="p-7 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed pb-3 border-b border-neutral-900/50">
                      {plan.details}
                    </p>
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs text-[#e3e6ed]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <div className="p-7 pt-0 mt-auto space-y-4">
                  <a href="/login" className="block w-full">
                    <Button 
                      className={`w-full py-5 h-auto text-xs font-bold shadow-lg transition-all ${
                        plan.recommended
                          ? "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-emerald-500/10"
                          : "bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </a>
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {plan.onboarding}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center pt-8">
            <p className="text-xs text-muted-foreground font-medium">*Applicable VAT, government fees, and Meta/WhatsApp charges are separate.</p>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Compare Plan Features</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Detailed capability matrix across all setup tiers</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-900 bg-neutral-950/20 backdrop-blur-md">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-900/40 text-muted-foreground font-bold text-xs">
                  <th className="p-4.5 w-[40%]">All plans · per month</th>
                  <th className="p-4.5 text-center w-[20%]">Starter</th>
                  <th className="p-4.5 text-center w-[20%]">Growth</th>
                  <th className="p-4.5 text-center w-[20%]">Managed</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((sec, secIdx) => (
                  <Fragment key={secIdx}>
                    <tr className="bg-neutral-900/20 border-b border-neutral-900">
                      <td colSpan={4} className="px-4.5 py-3 text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                        {sec.category}
                      </td>
                    </tr>
                    {sec.features.map((feat, featIdx) => (
                      <tr 
                        key={featIdx} 
                        className="border-b border-neutral-900/60 hover:bg-neutral-900/10 transition-colors duration-150"
                      >
                        <td className="p-4.5 text-xs sm:text-sm text-muted-foreground font-medium">
                          {feat.name}
                        </td>
                        <td className="p-4.5 text-center text-xs">
                          {feat.starter === "yes" ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : feat.starter === "no" ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-950 border border-neutral-900 text-muted-foreground">
                              {feat.starter}
                            </span>
                          )}
                        </td>
                        <td className="p-4.5 text-center text-xs">
                          {feat.growth === "yes" ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : feat.growth === "no" ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              {feat.growth}
                            </span>
                          )}
                        </td>
                        <td className="p-4.5 text-center text-xs">
                          {feat.managed === "yes" ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : feat.managed === "no" ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              {feat.managed}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
