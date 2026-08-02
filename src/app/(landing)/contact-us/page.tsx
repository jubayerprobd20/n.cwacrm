"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API request
    setTimeout(() => {
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Background glow overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Info Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  Contact Support
                </Badge>
                <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight text-white leading-tight">
                  Let's start the <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    conversation.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Have questions about our pricing tiers, configuration assistance, setup workflows, or custom API plugins? Our support team is here to help.
                </p>
              </div>

              {/* Trust/Regulatory info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5.5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
                  <Mail className="w-5.5 h-5.5 text-emerald-400" />
                  <span className="font-bold text-white block text-sm">Email Inquiry</span>
                  <a href="mailto:support@nextcorebd.com" className="text-xs text-muted-foreground hover:text-white transition-colors">
                    support@nextcorebd.com
                  </a>
                </div>

                <div className="p-5.5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
                  <MapPin className="w-5.5 h-5.5 text-teal-400" />
                  <span className="font-bold text-white block text-sm">HQ Office</span>
                  <span className="text-xs text-muted-foreground block">
                    Bangladesh
                  </span>
                </div>

                <div className="p-5.5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
                  <Clock className="w-5.5 h-5.5 text-emerald-400" />
                  <span className="font-bold text-white block text-sm">Working Hours</span>
                  <span className="text-xs text-muted-foreground block">
                    Mon - Sat: 9 AM - 6 PM BST
                  </span>
                </div>

                <div className="p-5.5 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
                  <MessageSquare className="w-5.5 h-5.5 text-teal-400" />
                  <span className="font-bold text-white block text-sm">Meta Partner</span>
                  <span className="text-xs text-muted-foreground block">
                    WABA Cloud API Compliant
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 blur-[90px] pointer-events-none" />
              <Card className="relative border border-neutral-900 bg-neutral-950/50 backdrop-blur-md p-6.5 sm:p-8 rounded-2xl">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <CardHeader className="p-0 pb-4 space-y-1.5 border-b border-neutral-900/60">
                      <CardTitle className="text-xl font-bold text-white">Send Inquiry</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Fill in the fields below and our specialist team will reach out.
                      </CardDescription>
                    </CardHeader>
                    
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Rahim Ahmed"
                          className="w-full bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="rahim@example.com"
                          className="w-full bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+880 1712 345678"
                          className="w-full bg-neutral-950 border border-neutral-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                          Message / Inquiry Details
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Describe your operational requirements, WABA details..."
                          className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full py-5 h-auto text-xs font-bold bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/10 gap-2 mt-2">
                      Submit Inquiry
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white">Inquiry Received!</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Thank you for reaching out, <span className="font-semibold text-white">{formData.name}</span>. Our integration specialist will contact you via email at <span className="font-semibold text-white">{formData.email}</span> shortly.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: "", email: "", phone: "", message: "" });
                      }}
                      variant="outline"
                      className="text-xs"
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
              </Card>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
