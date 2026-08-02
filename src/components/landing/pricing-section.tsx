"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
  const pricingPlans = [
    {
      name: "Starter",
      tagline: "Full control. You run it.",
      price: "৳2,999",
      period: "/month",
      setup: "No setup fee",
      cta: "Get Started",
      onboarding: "Set up your workspace and connect one WhatsApp Business number.",
      popular: false,
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
      period: "first month",
      setup: "৳2,999/month after the first month",
      cta: "Book a Call",
      onboarding: "Assisted onboarding and workspace configuration.",
      popular: true,
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
      period: "first month",
      setup: "৳2,999/month after the first month",
      cta: "Book a Call",
      onboarding: "Custom onboarding scope is agreed before work begins.",
      popular: false,
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

  return (
    <section id="pricing" className="py-24 bg-neutral-950/40 border-y border-neutral-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary">
            Pricing Plans
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
            Flexible Plans, No Hidden Fees
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent BDT pricing for Bangladesh businesses. Meta/WhatsApp conversation charges and applicable taxes are billed separately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col justify-between border bg-neutral-900/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 !overflow-visible ${
                plan.popular ? 'border-emerald-500 shadow-2xl shadow-emerald-500/5 bg-neutral-900/40' : 'border-neutral-900'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase px-3 py-1 whitespace-nowrap">
                  Most Popular
                </Badge>
              )}
              <div>
                <CardHeader className="p-7 border-b border-neutral-900">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                    {plan.name}
                  </span>
                  <CardTitle className="text-base text-white mt-1.5 font-bold">{plan.tagline}</CardTitle>
                  <div className="mt-5 flex items-baseline gap-1 py-2 border-y border-neutral-900/50">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-xs text-muted-foreground">/{plan.period}</span>}
                  </div>
                  <div className="text-xs font-medium text-emerald-400 mt-2.5">
                    {plan.setup}
                  </div>
                </CardHeader>
                <CardContent className="p-7 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-[#e3e6ed]">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </div>
              <div className="p-7 pt-0 mt-auto space-y-4">
                <Link href="/login" className="block w-full">
                  <Button
                    className={`w-full py-5 h-auto text-xs font-bold shadow-lg transition-all ${
                      plan.popular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/10'
                        : 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
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
      </div>
    </section>
  );
}
