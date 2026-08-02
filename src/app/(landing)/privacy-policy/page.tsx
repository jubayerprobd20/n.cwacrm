"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              <Shield className="w-3.5 h-3.5" /> Security & Compliance
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: June 23, 2026</p>
          </div>

          {/* Policy content */}
          <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Welcome to N.C WaCRM. We are committed to protecting your business operations, client details, and transaction histories. This Privacy Policy details how we collect, store, isolate, and handle data when utilizing our multi-tenant SaaS WhatsApp CRM.
            </p>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">1. Information We Collect</h3>
              <p>
                To provide a fully integrated CRM, we process distinct categories of information:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Parameters:</strong> Sign-up credentials, organization roles, team member profiles, custom domains, and support branding preferences.</li>
                <li><strong>WhatsApp Metadata:</strong> Connected WABA phone numbers, WhatsApp Business Account parameters, co-existence setup configs, and webhook URLs.</li>
                <li><strong>Message Streams:</strong> Opted-in client contact lists, sent/received messages, chatbot prompts, campaign templates, and response rates.</li>
                <li><strong>Billing Details:</strong> SSLCommerz / bKash integration parameters, subscription plans, and transaction receipts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">2. Multi-Tenant Data Isolation</h3>
              <p>
                Our system utilizes a premium multi-tenant database configuration powered by Supabase.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Every database table includes an isolated <code>account_id</code> or <code>workspace_id</code> field.</li>
                <li>We enforce strict Row-Level Security (RLS) policies. No user or agent can query, insert, or view records belonging to another workspace.</li>
                <li>Custom domains map securely to specific workspace tokens, guaranteeing complete logical separation of tenant data streams.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">3. How Data is Shared</h3>
              <p>
                We do not sell, rent, or distribute your client contact sheets or message logs to third parties. Data is only communicated under specific parameters:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Meta Developers:</strong> All automated outgoing messages are securely routed to Meta's Cloud API nodes.</li>
                <li><strong>Integration Endpoints:</strong> Data is shared with external services (like Google Sheets, SSLCommerz / bKash, or local school ERP nodes) only when explicitly configured and authenticated by your workspace administrator.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">4. User Rights & Data Retention</h3>
              <p>
                You retain complete control of your workspace data. You can delete uploaded contacts, clear message logs, or purge chatbot vector stores at any time. When a subscription is canceled and the data lockout period expires, all tenant records are permanently deleted from our primary database nodes.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t border-neutral-900/60 text-center">
              <h3 className="text-base font-bold text-white">5. Contact Support</h3>
              <p>
                For questions regarding data processing, security compliance, or to request a tenant data export, please reach out to our desk:
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
