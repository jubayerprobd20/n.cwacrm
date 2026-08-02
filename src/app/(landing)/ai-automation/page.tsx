"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Sparkles, 
  Calendar, 
  Brain, 
  Zap, 
  UserCheck, 
  Cpu, 
  CheckCircle 
} from "lucide-react";

export default function AiAutomationPage() {
  const [selectedModel, setSelectedModel] = useState("gpt4o");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a friendly customer concierge for Acme Corp. Assess if the user's monthly message volume exceeds 10,000, and if so, tag as 'High Value' and request their email address to route to Sarah."
  );

  const benefits = [
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Let the AI agent schedule meetings automatically. Sync with calendars and trigger confirmation messages instantly.",
      color: "text-emerald-400"
    },
    {
      icon: Brain,
      title: "Semantic Vector Sync",
      description: "Sync your FAQs, product catalogs, and help center articles to vector stores so the agent always stays on-brand.",
      color: "text-teal-400"
    },
    {
      icon: UserCheck,
      title: "Hybrid Human Hand-off",
      description: "Agent seamlessly stops auto-replies when a human rep intervenes. Set triggers for instant human assistance alerts.",
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Glow overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        {/* Hero Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Bot className="w-4 h-4" />
                AI Conversational Agents
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
                Conversational AI <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  that Closes Deals.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Stop waiting for agents to type response messages. Deploy an autonomous intelligence layer directly on WhatsApp. Qualify lead budgets, identify needs, answering product catalog queries instantly.
              </p>
              <div className="pt-2">
                <a href="/login">
                  <Button className="px-8 py-6 h-auto text-base font-semibold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/95 text-white">
                    Deploy AI Agent
                  </Button>
                </a>
              </div>
            </div>

            {/* Interactive Chat Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/5 blur-[90px] pointer-events-none" />
              <div className="relative mx-auto select-none" style={{ width: "295px" }}>
                {/* Phone mockup chassis */}
                <div className="relative rounded-[36px] bg-neutral-900 border border-neutral-800 p-2.5 shadow-2xl">
                  {/* Speaker slot / dynamic island */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-xl z-20" />
                  
                  {/* Phone screen */}
                  <div className="rounded-[30px] overflow-hidden bg-neutral-950 flex flex-col h-[480px]">
                    {/* Header */}
                    <div className="bg-[#075E54] pt-8 pb-3 px-5 flex items-center justify-between text-white">
                      <span className="text-[11px] font-bold">9:41</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
                      </div>
                    </div>
                    {/* Chat Info */}
                    <div className="bg-[#075E54] px-4 py-2 flex items-center gap-3 border-t border-white/10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-sm">
                        AI
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Acme Concierge</p>
                        <p className="text-[10px] text-white/70">AI Assistant · online</p>
                      </div>
                    </div>
                    {/* Message Area */}
                    <div className="flex-1 bg-[#e5ddd5] p-3.5 space-y-3 overflow-y-auto flex flex-col justify-end">
                      <div className="bg-white rounded-lg p-2.5 max-w-[85%] self-start shadow-sm text-neutral-800 text-[11px]">
                        Hello! I am looking for a demo of your CRM.
                        <span className="block text-[8px] text-neutral-400 text-right mt-1">9:42 AM</span>
                      </div>
                      <div className="bg-[#d9fdd3] rounded-lg p-2.5 max-w-[85%] self-end shadow-sm text-neutral-800 text-[11px]">
                        Hi! I'd love to show you N.C WaCRM. Can I ask your monthly message volume first?
                        <span className="block text-[8px] text-emerald-600 text-right mt-1">9:42 AM</span>
                      </div>
                    </div>
                    {/* Input Bar */}
                    <div className="bg-neutral-100 p-2 flex items-center gap-2">
                      <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-neutral-400 border border-neutral-200">
                        Type a message
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center text-white">
                        ✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Playground Simulator section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wide">
                <Cpu className="w-4 h-4" />
                Agent Playground
              </div>
              <h3 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight">
                Configure prompt instructions dynamically.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Select your preferred models (GPT-4o, Claude, or custom LLMs) and tailor prompt parameters to match your company's support tone.
              </p>
              
              {/* Select Model Mock Options */}
              <div className="flex flex-col gap-2.5 pt-4">
                <button
                  onClick={() => setSelectedModel("gpt4o")}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedModel === "gpt4o"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-neutral-950 border-neutral-900 text-muted-foreground hover:text-white"
                  }`}
                >
                  GPT-4o Engine (Recommended)
                </button>
                <button
                  onClick={() => setSelectedModel("claude")}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedModel === "claude"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-neutral-950 border-neutral-900 text-muted-foreground hover:text-white"
                  }`}
                >
                  Claude 3.5 Sonnet
                </button>
              </div>
            </div>

            {/* Config simulator card */}
            <div className="lg:col-span-2 rounded-2xl border border-neutral-900 bg-neutral-950/40 p-6 backdrop-blur flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                  System Prompt Instructions
                </span>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-900 rounded-xl p-4 text-xs font-mono text-white leading-relaxed focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
              <div className="flex items-center justify-between border-t border-neutral-900 pt-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Auto-saves to agent memory
                </div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded px-2.5 py-0.5 font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="relative rounded-2xl border border-neutral-900 bg-neutral-950/40 p-6 flex flex-col justify-between hover:border-neutral-800 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-800">
                    <benefit.icon className={`w-5.5 h-5.5 ${benefit.color}`} />
                  </div>
                  <h4 className="text-base font-bold text-white">{benefit.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
