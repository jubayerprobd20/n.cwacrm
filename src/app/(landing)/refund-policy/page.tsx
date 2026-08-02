"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Landmark } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Background glow overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-10">
          
          {/* Header */}
          <div className="space-y-4 border-b border-neutral-900 pb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5" /> Refund Policy
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Subscription &amp; Refund Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: June 23, 2026</p>
          </div>

          {/* Policy content */}
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              At N.C WaCRM, we deliver professional WhatsApp CRM and communication automation services. This policy clarifies terms regarding recurring subscriptions, setup configurations, custom developments, consulting sessions, and billing queries.
            </p>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">1. SaaS Subscriptions</h3>
              <p>
                Our software platform is provided on a subscription basis (monthly or annually).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Subscribing plans carry a flat rate pass-through for Meta Business Platform usage fees without markups.</li>
                <li>All subscription payments are non-refundable once the billing cycle begins.</li>
                <li>You can cancel your subscription at any time to avoid future renewals; your dashboard access will remain active until the end of your prepaid period.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">2. Account Onboarding &amp; Setup Fees</h3>
              <p>
                Setup and integration fees cover the direct labor involved in configuring your Meta Business Manager, applying for WhatsApp Business Account status, and mapping numbers.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>These onboarding fees are non-refundable once configuration or account consultation has commenced.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">3. Custom Development Workflows</h3>
              <p>
                Fees collected for custom chatbot integrations, dedicated API plugins, webhook configurations, and customized flow building are governed by project-specific service level agreements (SLAs).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Since custom engineering involves dedicated development resources, these items are non-refundable once development milestones begin.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">4. Consultation Services</h3>
              <p>
                Fees for professional consultation sessions, strategy planning calls, and Meta compliance audits are earned upon booking. If you need to reschedule a consulting slot, you must contact your representative at least 24 hours in advance. No-shows or cancellations inside 24 hours are non-refundable.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">5. Billing Disputes &amp; Resolution</h3>
              <p>
                If you identify a duplicate charge or billing error on your statement, you agree to raise an inquiry with our support department within 14 days of the invoice date.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We investigate all queries in good faith and correct verified platform glitches or billing errors immediately.</li>
                <li>Initiating unauthorized chargebacks without contacting our billing desk will result in immediate workspace lockouts and possible collection procedures.</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-neutral-900/60 text-center">
              <h3 className="text-base font-bold text-white">6. Contact Support</h3>
              <p>
                For any queries regarding billing, invoice breakdowns, or cancellations, please contact our support desk:
              </p>
              <div className="text-xs text-muted-foreground mt-3">
                <p className="font-bold text-white">NextCore BD Technologies</p>
                <p>Email: <a href="mailto:support@nextcorebd.com" className="text-primary hover:underline">support@nextcorebd.com</a></p>
              </div>
            </section>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
