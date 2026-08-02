"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-border/40 bg-neutral-950 py-16 px-4 md:px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-8 relative z-10">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-primary to-violet-600 flex items-center justify-center shadow shadow-primary/25">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 1.48.36 2.87 1 4.1L3 21l4.9-1c1.24.64 2.62 1 4.1 1Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2" fill="currentColor" className="text-emerald-400" />
                <path d="M8 12h0.01M16 12h0.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">N.C WaCRM</span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            N.C WaCRM is a premium AI-powered WhatsApp CRM and customer support automation platform. Automate business communication, configure smart chatbots, organize leads, and sync calendar reminders using the official WhatsApp Business API.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
              Official Meta Business Partner
            </span>
          </div>
        </div>

        {/* Solutions Column */}
        <div className="col-span-1 space-y-4">
          <h6 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Solutions</h6>
          <ul className="space-y-2.5">
            <li>
              <Link href="/features" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/ai-automation" className="text-xs text-muted-foreground hover:text-white transition-colors">
                AI Automation
              </Link>
            </li>
            <li>
              <Link href="/" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Use Cases
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links Column */}
        <div className="col-span-1 space-y-4">
          <h6 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Quick Links</h6>
          <ul className="space-y-2.5">
            <li>
              <Link href="/about-us" className="text-xs text-muted-foreground hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="text-xs text-muted-foreground hover:text-white transition-colors">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us Column */}
        <div className="col-span-1 space-y-4">
          <h6 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Contact Us</h6>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li>NextCore BD Technologies</li>
            <li>Bangladesh</li>
            <li className="pt-1">
              <a href="mailto:support@nextcorebd.com" className="text-primary hover:underline">
                support@nextcorebd.com
              </a>
            </li>
          </ul>
        </div>

        {/* Trust Signals Column */}
        <div className="col-span-1 space-y-4">
          <h6 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Trust Signals</h6>
          <ul className="space-y-2 text-[10px] text-muted-foreground font-semibold">
            <li className="text-emerald-400">✓ Secure Platform</li>
            <li className="text-emerald-400">✓ Data Encryption</li>
            <li className="text-emerald-400">✓ Meta-Compliant</li>
            <li className="text-emerald-400">✓ Role-Based Access</li>
            <li className="text-emerald-400">✓ Business Support</li>
          </ul>
        </div>
      </div>

      {/* Legal & Copyright */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/20 space-y-4 relative z-10 text-center">
        <p className="text-[10px] leading-relaxed text-muted-foreground max-w-3xl mx-auto">
          "N.C WaCRM uses WhatsApp Business API solutions in accordance with Meta and WhatsApp Business policies. Businesses are responsible for obtaining user consent before initiating communication."
        </p>
        <div className="text-[10px] text-muted-foreground pt-2 flex items-center justify-center gap-2">
          <span>© {currentYear} N.C WaCRM. All rights reserved.</span>
          <span>•</span>
          <a
            href="https://nextcorebd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Powered by NextCore BD
          </a>
        </div>
      </div>
    </footer>
  );
}
