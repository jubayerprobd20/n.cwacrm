"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Workflow,
  Sparkles,
  CheckCheck,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Check,
  ChevronRight,
  Database
} from "lucide-react";

interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
}

const slides: SlideData[] = [
  {
    title: "Team Shared Inbox",
    subtitle: "Collaborate in Real-Time",
    description: "Manage a single WhatsApp Business number with your entire team. Assign chats, leave internal notes, and resolve queries faster together.",
    tag: "Multi-Agent Support",
    icon: Users,
  },
  {
    title: "Smart Broadcasts",
    subtitle: "Reach Customers at Scale",
    description: "Send WhatsApp template messages to thousands of opt-in customers. Customize variables, schedule runs, and track delivery rates live.",
    tag: "High-Delivery Campaigns",
    icon: Send,
  },
  {
    title: "No-Code Flow Builder",
    subtitle: "Automate Conversations Visualizing Flow",
    description: "Automate FAQs, lead qualification, and customer routing. Design interactive chatbot journeys with drag-and-drop simplicity.",
    tag: "Visual Automation",
    icon: Workflow,
  },
  {
    title: "AI Reply Assistant",
    subtitle: "Put Support on Autopilot",
    description: "Train AI on your documents and let it answer common queries instantly or draft replies for your support staff to approve.",
    tag: "Powered by Claude & GPT",
    icon: Sparkles,
  },
];

export function AuthShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden h-full w-full flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex lg:col-span-6 xl:col-span-7 border-r border-white/5">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Glow Orbs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 opacity-40 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-500/10 opacity-30 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/20 opacity-40 blur-3xl" />

      {/* Top Section - Brand Identity */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-emerald-500 shadow-lg shadow-indigo-500/25">
          <svg className="h-5.5 w-5.5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 1.48.36 2.87 1 4.1L3 21l4.9-1c1.24.64 2.62 1 4.1 1Z"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2" className="fill-emerald-400 animate-pulse" />
            <path d="M8 12h0.01M16 12h0.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-white leading-none">N.C WaCRM</span>
          <span className="text-[10px] text-indigo-400/80 mt-1 font-bold tracking-wider uppercase">Business OS</span>
        </div>
      </div>

      {/* Middle Section - Dynamic Product Mockup */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-2xl shadow-black/40 ring-1 ring-white/5">
          {/* Mockup Topbar */}
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-slate-500 font-mono">wacrm.nextcorebd.com/dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-950/50 px-2.5 py-0.5 border border-white/5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Live CRM Connected</span>
            </div>
          </div>

          {/* Dynamic Mockup Content */}
          <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-slate-950/80 p-4 border border-white/5">
            {activeSlide === 0 && <MockInbox />}
            {activeSlide === 1 && <MockBroadcasts />}
            {activeSlide === 2 && <MockFlowBuilder />}
            {activeSlide === 3 && <MockAIAssistant />}
          </div>
        </div>
      </div>

      {/* Bottom Section - Testimonials and Features Slider */}
      <div className="relative z-10 mt-auto">
        <div className="mb-8 min-h-[120px]">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            {(() => {
              const Icon = slides[activeSlide].icon;
              return <Icon className="h-3.5 w-3.5" />;
            })()}
            {slides[activeSlide].tag}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white tracking-tight">
            {slides[activeSlide].subtitle}
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-xl">
            {slides[activeSlide].description}
          </p>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index ? "w-8 bg-indigo-500" : "w-1.5 bg-slate-700 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">99.8%</span> uptime
            </div>
            <div className="h-3 w-px bg-white/5" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">100%</span> secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
 * MOCKUP SUB-COMPONENTS (Pure CSS/HTML)
 * ========================================== */

function MockInbox() {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Mock Header info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[11px] text-slate-500">
        <span>Shared Inbox</span>
        <span>Active Agents: 4 online</span>
      </div>
      
      {/* Inbox Split view */}
      <div className="grid grid-cols-12 gap-3 h-full">
        {/* Chats list */}
        <div className="col-span-5 flex flex-col gap-2 border-r border-white/5 pr-2">
          <div className="rounded bg-indigo-500/10 border border-indigo-500/20 p-1.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white">Amit Sharma</span>
              <span className="text-[8px] rounded bg-indigo-500/30 px-1 text-indigo-300 font-medium">AI Active</span>
            </div>
            <p className="mt-0.5 text-[8px] text-slate-400 truncate">Let me check available rooms...</p>
          </div>
          
          <div className="rounded bg-white/5 border border-white/5 p-1.5 text-left opacity-75">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-300">Priya Nair</span>
              <span className="text-[8px] text-slate-500">2m ago</span>
            </div>
            <p className="mt-0.5 text-[8px] text-slate-500 truncate">Thanks for sharing the catalogue.</p>
          </div>

          <div className="rounded bg-white/5 border border-white/5 p-1.5 text-left opacity-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-300">Rajesh Patel</span>
              <span className="text-[8px] text-slate-500">5m ago</span>
            </div>
            <p className="mt-0.5 text-[8px] text-slate-500 truncate">Is delivery free to Delhi?</p>
          </div>
        </div>

        {/* Chat Thread preview */}
        <div className="col-span-7 flex flex-col justify-between h-full min-h-[180px]">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-1">
            <span className="text-[10px] font-bold text-indigo-400">Amit Sharma</span>
            <span className="text-[8px] text-slate-500">Assigned: Priya (Agent)</span>
          </div>

          {/* Chat bubbles */}
          <div className="flex flex-col gap-2 py-2 flex-1 overflow-y-auto">
            {/* Incoming bubble */}
            <div className="self-start max-w-[80%] rounded bg-slate-900 p-2 text-left border border-white/5">
              <p className="text-[9px] text-slate-200">Hello! Do you deliver to Bangalore? And how many days does it take?</p>
            </div>
            
            {/* Private Note bubble */}
            <div className="self-center w-full rounded bg-yellow-500/5 border border-dashed border-yellow-500/20 p-1.5 text-center my-0.5">
              <p className="text-[8px] text-yellow-400/90 font-mono">⚡ Note: Lead requested catalog. Sending catalog is advised.</p>
            </div>

            {/* Outgoing bubble */}
            <div className="self-end max-w-[80%] rounded bg-indigo-600 p-2 text-left shadow-lg">
              <p className="text-[9px] text-white">Yes, we deliver to Bangalore in 2-3 business days. Here is our product catalog link!</p>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="text-[7px] text-indigo-200">12:04 PM</span>
                <CheckCheck className="h-2.5 w-2.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Composer Mock */}
          <div className="flex items-center gap-1 border-t border-white/5 pt-1.5">
            <div className="flex-1 rounded bg-slate-900 border border-white/5 py-1 px-2 text-[9px] text-slate-500 text-left">
              Type a message...
            </div>
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockBroadcasts() {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[11px] text-slate-500">
        <span>Broadcast Manager</span>
        <span>Daily Limit: Unlimited (Meta API)</span>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded bg-white/5 border border-white/5 p-2 text-left">
          <span className="text-[8px] text-slate-500 font-medium block">Total Sent</span>
          <span className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
            42,500 <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
          </span>
        </div>
        <div className="rounded bg-white/5 border border-white/5 p-2 text-left">
          <span className="text-[8px] text-slate-500 font-medium block">Delivered</span>
          <span className="text-xs font-bold text-emerald-400 mt-0.5">99.8%</span>
        </div>
        <div className="rounded bg-white/5 border border-white/5 p-2 text-left">
          <span className="text-[8px] text-slate-500 font-medium block">Read Rate</span>
          <span className="text-xs font-bold text-indigo-400 mt-0.5">85.4%</span>
        </div>
      </div>

      {/* Campaign List */}
      <div className="flex flex-col gap-2 mt-1">
        <span className="text-[9px] font-bold text-slate-400 text-left">Recent Campaigns</span>
        
        {/* Campaign 1 */}
        <div className="rounded bg-slate-900 border border-white/5 p-2 text-left">
          <div className="flex items-center justify-between text-[9px]">
            <span className="font-semibold text-white">Diwali Festive Offer</span>
            <span className="rounded bg-emerald-500/10 px-1 text-[8px] font-medium text-emerald-400 border border-emerald-500/20">Sent</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
            </div>
            <span className="text-[8px] text-slate-400 font-mono">10,000/10,000</span>
          </div>
        </div>

        {/* Campaign 2 */}
        <div className="rounded bg-slate-900 border border-white/5 p-2 text-left">
          <div className="flex items-center justify-between text-[9px]">
            <span className="font-semibold text-white">Product Catalog Blast</span>
            <span className="rounded bg-indigo-500/10 px-1 text-[8px] font-medium text-indigo-400 border border-indigo-500/20 animate-pulse">Running</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full w-[65%] rounded-full bg-indigo-500" />
            </div>
            <span className="text-[8px] text-slate-400 font-mono">6,500/10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockFlowBuilder() {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[11px] text-slate-500">
        <span>No-Code Automation Builder</span>
        <span className="text-emerald-500 font-semibold">Active Flow</span>
      </div>

      {/* Visual Canvas Nodes */}
      <div className="relative flex flex-col items-center gap-3 py-1.5">
        {/* Node 1: Trigger */}
        <div className="relative z-10 w-[70%] rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-2 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center gap-1.5 text-left">
            <span className="rounded bg-indigo-500 p-0.5 text-white">
              <MessageSquare className="h-2.5 w-2.5" />
            </span>
            <div>
              <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-semibold">Trigger</span>
              <span className="text-[9px] font-bold text-white">Incoming Message contains: &quot;price&quot;</span>
            </div>
          </div>
        </div>

        {/* Connector Line 1 */}
        <div className="h-3 w-0.5 bg-indigo-500/40 relative">
          <div className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-indigo-400 animate-ping" />
        </div>

        {/* Node 2: Logic Switch */}
        <div className="relative z-10 w-[70%] rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 shadow-lg">
          <div className="flex items-center gap-1.5 text-left">
            <span className="rounded bg-amber-500 p-0.5 text-white">
              <Clock className="h-2.5 w-2.5" />
            </span>
            <div>
              <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-semibold">Condition</span>
              <span className="text-[9px] font-bold text-white">Check Business Hours?</span>
            </div>
          </div>
        </div>

        {/* Split Connectors */}
        <div className="flex w-[80%] items-center justify-between px-6 -my-1 text-[8px] font-bold">
          <span className="text-emerald-400">Yes</span>
          <span className="text-amber-400">No</span>
        </div>

        {/* Double Connector Lines */}
        <div className="flex w-[70%] justify-between px-6">
          <div className="h-4 w-0.5 bg-emerald-500/40" />
          <div className="h-4 w-0.5 bg-amber-500/40" />
        </div>

        {/* Node 3 & 4: Actions */}
        <div className="flex w-full justify-between gap-3">
          <div className="w-[48%] rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-left">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-semibold">Action</span>
            <span className="text-[9px] font-bold text-white">Send Price Catalog</span>
          </div>
          <div className="w-[48%] rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-left">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-semibold">Action</span>
            <span className="text-[9px] font-bold text-white">Send Out of Office Text</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockAIAssistant() {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[11px] text-slate-500">
        <span>AI Reply Agent Configurator</span>
        <span>Model: Claude 3.5 Sonnet</span>
      </div>

      <div className="grid grid-cols-12 gap-3 h-full">
        {/* Knowledge Base Sources */}
        <div className="col-span-4 flex flex-col gap-1.5 border-r border-white/5 pr-2 text-left">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Sources</span>
          
          <div className="flex items-center gap-1 rounded bg-slate-900 p-1 text-[8px] text-slate-300">
            <FileText className="h-2 w-2 text-indigo-400" />
            <span className="truncate">pricing_2026.pdf</span>
          </div>
          
          <div className="flex items-center gap-1 rounded bg-slate-900 p-1 text-[8px] text-slate-300">
            <FileText className="h-2 w-2 text-indigo-400" />
            <span className="truncate">faq_list.xlsx</span>
          </div>
          
          <div className="flex items-center gap-1 rounded bg-slate-900 p-1 text-[8px] text-slate-300">
            <Database className="h-2 w-2 text-indigo-400" />
            <span className="truncate">CRM Context</span>
          </div>
        </div>

        {/* Live Playground */}
        <div className="col-span-8 flex flex-col justify-between min-h-[170px] text-left">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Live Answer Suggestion</span>

          {/* AI suggestion thread */}
          <div className="flex flex-col gap-2 py-1.5 flex-1 justify-center">
            {/* User message */}
            <div className="rounded bg-slate-900 border border-white/5 p-1.5 text-[8px] self-start max-w-[90%]">
              <span className="text-slate-500 font-bold block">User</span>
              <span className="text-slate-300">Is there a reseller plan for Bangladesh agencies?</span>
            </div>

            {/* AI Response Draft suggestion */}
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-2 self-end max-w-[90%] relative shadow-lg shadow-indigo-500/5">
              <div className="absolute -top-1.5 -left-1.5 rounded-full bg-indigo-600 p-0.5 text-white">
                <Sparkles className="h-2 w-2" />
              </div>
              <span className="text-indigo-400 font-bold text-[8px] block">AI Suggested Draft</span>
              <p className="text-[8px] text-white mt-0.5 leading-normal">
                Yes! We offer white-label reseller controls with branding and client-workspace management. Domain and payment setup are scoped separately.
              </p>
            </div>
          </div>

          {/* Suggestion actions */}
          <div className="flex gap-1.5 pt-1 border-t border-white/5">
            <button className="flex-1 rounded bg-indigo-600 text-white text-[8px] py-1 text-center font-bold hover:bg-indigo-500 transition-colors cursor-pointer flex items-center justify-center gap-0.5">
              <Check className="h-2 w-2" /> Approve & Send
            </button>
            <button className="rounded border border-white/10 text-slate-400 text-[8px] px-1.5 py-1 text-center hover:bg-white/5 transition-colors cursor-pointer">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
