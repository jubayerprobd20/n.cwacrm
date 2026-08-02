"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Scale } from "lucide-react";

export default function TermsAndConditionsPage() {
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
              <Scale className="w-3.5 h-3.5" /> Legal Document
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Terms & Conditions</h1>
            <p className="text-xs text-muted-foreground">Last updated: June 23, 2026</p>
          </div>

          {/* Terms content */}
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Welcome to N.C WaCRM. These Terms & Conditions ("Terms") govern your access to and use of the website, SaaS dashboard, automation engines, APIs, and customer relationship interfaces provided by N.C WaCRM Technologies ("we", "us", or "our"). By subscribing to or utilizing our Platform, you agree to comply with and be bound by these Terms.
            </p>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">1. SaaS Subscription & Billing</h3>
              <p>
                Subscribing to N.C WaCRM grants your business a non-exclusive, non-transferable, revocable license to access our platform services.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Subscriptions are billed monthly or annually in advance based on the plan selected.</li>
                <li>Setup fees (if applicable) and custom configuration/consulting fees are collected prior to service provisioning.</li>
                <li>Failure to pay active subscription invoices will result in account lockout and eventual data purge.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">2. User Responsibilities & Acceptable Use</h3>
              <p>
                You agree to use N.C WaCRM only for lawful business operations and in absolute compliance with local, national, and international laws.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must verify and manage the permissions of any team member added to your workspace.</li>
                <li>You are responsible for obtaining explicit opt-in consent from end-users/customers before messaging them.</li>
                <li>You are prohibited from using this Platform to distribute spam, fraudulent deals, threat messages, or unsolicited marketing material.</li>
                <li>You must not reverse engineer, decompile, or attempt to disrupt the performance of our SaaS nodes.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">3. Meta & WhatsApp Policy Compliance</h3>
              <p>
                N.C WaCRM operates using the official WhatsApp Business API provided by Meta. All customers must comply with Meta's developer policies and WhatsApp Business Platform guidelines.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You represent that your business profile, logos, and links submitted for verification are authentic.</li>
                <li>Bulk blasting, automated message bombing, and scrapers are strictly prohibited.</li>
                <li>You agree to comply with WhatsApp's template pre-approval workflows.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">4. Account Suspension & Termination</h3>
              <p>
                We reserve the right to suspend or permanently terminate your workspace access, without refund, under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Detection of unauthorized bulk messaging or automated spam reports from WhatsApp users.</li>
                <li>Suspension or termination of your WhatsApp Business Account (WABA) by Meta due to policy violations.</li>
                <li>Non-compliance with acceptable usage policies or local governing regulations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">5. Intellectual Property</h3>
              <p>
                All technology, graphic user interfaces, chatbot designs, workflow visualizations, logos, and custom code modules remain the exclusive intellectual property of N.C WaCRM Technologies or its licensors. You may not distribute or copy any portion of our software.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">6. Service Limitations & Disclaimers</h3>
              <p>
                N.C WaCRM is provided on an "AS IS" and "AS AVAILABLE" basis. While we maintain a high standard of platform stability, we do not warrant that service will be uninterrupted.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We are not responsible for delivery delays or downtime caused directly by Meta/WhatsApp API node failures.</li>
                <li>We do not control client carrier connections or recipient network coverage.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">7. Governing Law & Jurisdiction</h3>
              <p>
                These Terms and any dispute arising from the use of this Platform shall be governed by, interpreted, and enforced in accordance with the laws of <strong>Bangladesh</strong>. Any disputes shall be subject to the exclusive jurisdiction of the courts located in <strong>Bangladesh</strong>.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-neutral-900/60 text-center">
              <h3 className="text-base font-bold text-white">8. Contact Us</h3>
              <p>
                If you have questions regarding these Terms & Conditions, contact NextCore BD Technologies:
              </p>
              <div className="text-xs text-muted-foreground mt-3">
                <p className="font-bold text-white">NextCore BD Technologies</p>
                <p>Bangladesh</p>
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
