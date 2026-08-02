import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Users,
  MessageSquare,
  Bot,
  Zap,
  Eye,
  Globe,
  Layers,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { PricingSection } from '@/components/landing/pricing-section';
import { ChatbotSimulator } from '@/components/landing/chatbot-simulator';

export const metadata: Metadata = {
  title: 'N.C WaCRM — Premium WhatsApp CRM & Business Automation Platform',
  description: 'Manage leads, automate customer communication, build visual chatbot flows, and scale your business with N.C WaCRM\'s official Meta WhatsApp API platform.',
  keywords: [
    'N.C WaCRM',
    'N.C WaCRM OS',
    'WhatsApp CRM',
    'WhatsApp Business API',
    'Shared Inbox',
    'Bangladesh WhatsApp CRM',
    'No-code Chatbot Builder',
    'Multi-tenant SaaS',
    'Bangladesh Business CRM',
    'Customer Engagement',
    'Automations',
    'Visual Flow Builder',
    'Meta Cloud API'
  ],
};

// Starry background component (pure CSS animations)
function StarryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-1/5 left-1/2 w-1 h-1 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/5 right-1/4 w-1 h-1 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '3.5s' }} />
    </div>
  );
}

// Floating animation wrapper (pure CSS animation)
function FloatAnimation({ children, delay = '0s' }: { children: React.ReactNode; delay?: string }) {
  return (
    <div className="animate-float" style={{ animationDelay: delay }}>
      {children}
    </div>
  );
}

// Tech stack badges
function TechStack() {
  const tech = [
    { name: 'Next.js 16', color: 'bg-black text-white border border-neutral-800' },
    { name: 'React 19', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    { name: 'TypeScript', color: 'bg-blue-600/10 text-blue-300 border border-blue-600/20' },
    { name: 'Tailwind CSS v4', color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
    { name: 'Supabase DB', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
    { name: 'Meta Cloud API', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
    { name: 'MongoDB Atlas', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {tech.map((t) => (
        <Badge key={t.name} className={`${t.color} px-3 py-1 text-xs font-normal rounded-full`}>
          {t.name}
        </Badge>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const features = [
    {
      id: 'shared-inbox',
      icon: Users,
      title: 'Shared Team Inbox',
      description: 'Multiple agents working on a single WhatsApp number. Direct conversation assignment, internal notes, and agent performance analytics.',
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/5 border-violet-500/10 hover:border-violet-500/30',
    },
    {
      id: 'flow-builder',
      icon: Zap,
      title: 'No-Code Flow Builder',
      description: 'Design visual chatbot automation workflows. Setup interactive list messages, button replies, delay nodes, and API webhooks.',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30',
    },
    {
      id: 'ai-reply',
      icon: Bot,
      title: 'AI Support Assistant',
      description: 'Intelligent auto-replies powered by OpenAI, Gemini, or Nvidia NIM. Automatically queries your KB to handle customer FAQs.',
      color: 'text-primary',
      bgColor: 'bg-primary/5 border-primary/10 hover:border-primary/30',
    },
    {
      id: 'templates',
      icon: MessageSquare,
      title: 'Message Templates & Broadcasts',
      description: 'Create approved WhatsApp templates, segment contacts, schedule broadcasts, and track delivery activity from one workspace.',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30',
    },
    {
      id: 'api-webhooks',
      icon: Globe,
      title: 'API & Webhooks',
      description: 'Connect your existing systems through webhooks and the public REST API without claiming unsupported pre-built integrations.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30',
    },
    {
      id: 'white-label',
      icon: Layers,
      title: 'White-Label Portal',
      description: 'Agencies can rebrand the platform. Configure your own agency logo, support domain, colors, and plans to sell to your clients.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/30',
    },
  ];

  const faqs = [
    {
      question: 'Is this an official WhatsApp business solution?',
      answer: 'Yes, N.C WaCRM utilizes the official Meta WhatsApp Cloud API. We do not use browser automation or unofficial web-client hacks, ensuring your business number is completely safe from suspension.',
    },
    {
      question: 'How does the White-Label feature work?',
      answer: 'Reseller accounts can manage branding settings, client workspaces, and credit controls. Domain, email, and payment-provider setup require a separate implementation scope.',
    },
    {
      question: 'Can we integrate it with our local billing or ERP systems?',
      answer: 'Yes. N.C WaCRM supports incoming and outgoing webhooks plus a public REST API, so a developer can connect your billing, ERP, or other business system.',
    },
    {
      question: 'Is there a limit to how many messages we can send?',
      answer: 'No, we do not charge per message. You only pay the flat subscription price. However, Meta\'s standard messaging fees for business-initiated conversations apply directly to your Meta billing account.',
    },
    {
      question: 'Do we need a dedicated server to host this?',
      answer: 'N.C WaCRM is optimized for Hostinger Managed Node.js, Vercel, or custom VPS. The setup is highly automated, and you can get up and running with a single-click deploy.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e3e6ed] relative overflow-x-hidden font-sans antialiased">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Starry Background */}
      <StarryBackground />

      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">Meta Business Partner</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7.5xl font-black tracking-tight text-white leading-tight mb-8">
            Complete WhatsApp CRM & <br/>
            <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Business Suite for Bangladesh
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[#9ea3b0] max-w-3xl mx-auto leading-relaxed mb-12">
            A shared team inbox, no-code visual chatbot flows, broadcast campaigns, and API access for Bangladesh businesses. Rebrand the workspace with your own agency identity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 h-auto text-base font-semibold shadow-xl shadow-primary/20 gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 h-auto text-base font-semibold border-neutral-800 hover:bg-neutral-900 gap-2">
                <Eye className="w-4 h-4" />
                Explore Features
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Official Cloud API
            </div>
            <span className="hidden sm:inline text-neutral-800">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SSLCommerz / bKash
            </div>
            <span className="hidden sm:inline text-neutral-800">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              White-Labeling Support
            </div>
          </div>

          <TechStack />
        </div>

        {/* Hero Mockup Visual & Chatbot Simulator */}
        <div className="mt-20 max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            
            {/* Chatbot Simulator Column */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="text-center lg:text-left mb-6 space-y-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                  Interactive Simulator
                </Badge>
                <h3 className="text-xl font-bold text-white">Experience AI Automation Live</h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Click the buttons inside the chat window to test our automated agent responses.
                </p>
              </div>
              <ChatbotSimulator />
            </div>

            {/* Dashboard Mockup Column */}
            <div className="lg:col-span-3 flex flex-col justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent z-10 pointer-events-none" />
              <div className="relative rounded-2xl p-2.5 bg-neutral-900/40 border border-neutral-800/80 shadow-2xl backdrop-blur-3xl h-full flex flex-col justify-between">
                <div className="bg-[#0e1117] rounded-xl overflow-hidden border border-neutral-900 flex-1 flex flex-col min-h-[460px]">
                  {/* Fake Window Header */}
                  <div className="h-11 bg-[#0b0d13] border-b border-neutral-900 px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono bg-neutral-950 px-4 py-1 rounded border border-neutral-900">
                      wacrm.nextcorebd.com/dashboard
                    </div>
                    <div className="w-12" />
                  </div>
                  {/* Fake Dashboard Body */}
                  <div className="flex-1 grid grid-cols-4 p-5 gap-5 bg-[#0a0c11]">
                    <div className="col-span-1 border-r border-neutral-900/80 pr-4 space-y-3.5 hidden sm:block">
                      <div className="w-full h-8 bg-primary/10 rounded border border-primary/20 flex items-center px-3 gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <div className="w-12 h-2 bg-primary/20 rounded" />
                      </div>
                      <div className="w-full h-8 rounded hover:bg-neutral-900/50 flex items-center px-3 gap-2">
                        <Users className="w-3.5 h-3.5 text-neutral-600" />
                        <div className="w-16 h-1.5 bg-neutral-800 rounded" />
                      </div>
                      <div className="w-full h-8 rounded hover:bg-neutral-900/50 flex items-center px-3 gap-2">
                        <Globe className="w-3.5 h-3.5 text-neutral-600" />
                        <div className="w-14 h-1.5 bg-neutral-800 rounded" />
                      </div>
                      <div className="w-full h-8 rounded hover:bg-neutral-900/50 flex items-center px-3 gap-2">
                        <Layers className="w-3.5 h-3.5 text-neutral-600" />
                        <div className="w-20 h-1.5 bg-neutral-800 rounded" />
                      </div>
                    </div>

                    <div className="col-span-4 sm:col-span-3 flex flex-col gap-5">
                      {/* Cards Row */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#0e1117] rounded-xl p-4 border border-neutral-900 flex flex-col justify-between">
                          <span className="text-[10px] text-muted-foreground">Active Chats</span>
                          <span className="text-lg sm:text-xl font-bold text-white mt-1.5">1,248</span>
                        </div>
                        <div className="bg-[#0e1117] rounded-xl p-4 border border-neutral-900 flex flex-col justify-between">
                          <span className="text-[10px] text-muted-foreground">Campaign reach</span>
                          <span className="text-lg sm:text-xl font-bold text-white mt-1.5">48,250</span>
                        </div>
                        <div className="bg-[#0e1117] rounded-xl p-4 border border-neutral-900 flex flex-col justify-between">
                          <span className="text-[10px] text-muted-foreground">AI Rate</span>
                          <span className="text-lg sm:text-xl font-bold text-white mt-1.5">84.2%</span>
                        </div>
                      </div>

                      {/* Graph Area */}
                      <div className="flex-1 bg-[#0e1117] rounded-xl border border-neutral-900 p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-white">Daily Message Analytics</span>
                          <Badge variant="outline" className="text-[8px] bg-neutral-950 border-neutral-800 text-emerald-400">Live</Badge>
                        </div>
                        <div className="flex-1 flex items-end gap-3.5 pt-4 h-28">
                          <div className="flex-1 bg-primary/20 rounded-t h-[40%] border-t border-primary/40" />
                          <div className="flex-1 bg-primary/30 rounded-t h-[60%] border-t border-primary/50" />
                          <div className="flex-1 bg-primary/20 rounded-t h-[30%] border-t border-primary/40" />
                          <div className="flex-1 bg-gradient-to-t from-primary/30 to-primary/60 rounded-t h-[85%] border-t border-primary" />
                          <div className="flex-1 bg-primary/20 rounded-t h-[50%] border-t border-primary/40" />
                          <div className="flex-1 bg-primary/40 rounded-t h-[70%] border-t border-primary/60" />
                          <div className="flex-1 bg-gradient-to-t from-primary/40 to-primary/80 rounded-t h-[95%] border-t-2 border-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tools Marquee Section */}
      <section className="py-10 border-b border-neutral-900 bg-neutral-950/20 relative">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Integrated With Your Favorite Tools
          </span>
          <div className="relative w-full overflow-hidden py-6 select-none">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                display: flex;
                width: max-content;
                animation: marquee 25s linear infinite;
              }
            `}</style>
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0c10] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0c10] to-transparent z-10 pointer-events-none" />
            <div className="animate-marquee flex gap-12 items-center">
              {[
                "Stripe", "Linear", "Zapier", "Vercel", "HubSpot", "Shopify",
                "Stripe", "Linear", "Zapier", "Vercel", "HubSpot", "Shopify"
              ].map((tool, idx) => (
                <div key={idx} className="flex items-center gap-2.5 opacity-40 hover:opacity-85 transition-opacity duration-300 cursor-pointer">
                  <div className="w-5 h-5 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-[9px] text-muted-foreground">
                    {tool[0]}
                  </div>
                  <span className="text-sm font-bold tracking-tight text-muted-foreground">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats Section */}
      <section className="py-20 border-b border-neutral-900/80 bg-[#0a0c10]/40 relative overflow-hidden">
        {/* Glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Social Proof
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
            Trusted by growing businesses
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2.5xl mx-auto mb-12">
            Scale customer engagement and run team operations using our compliant WhatsApp CRM engine.
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6 sm:p-8 backdrop-blur-md hover:border-primary/20 transition-all duration-300 group">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Businesses Served</span>
              <span className="text-3xl sm:text-4xl font-black text-white mt-3 block group-hover:text-primary transition-colors">10,000+</span>
            </div>
            
            <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6 sm:p-8 backdrop-blur-md hover:border-primary/20 transition-all duration-300 group">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Messages Sent</span>
              <span className="text-3xl sm:text-4xl font-black text-white mt-3 block group-hover:text-primary transition-colors">50M+</span>
            </div>
            
            <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6 sm:p-8 backdrop-blur-md hover:border-primary/20 transition-all duration-300 group">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Uptime Guarantee</span>
              <span className="text-3xl sm:text-4xl font-black text-white mt-3 block group-hover:text-primary transition-colors">98%</span>
            </div>
            
            <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6 sm:p-8 backdrop-blur-md hover:border-primary/20 transition-all duration-300 group">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customer Rating</span>
              <span className="text-3xl sm:text-4xl font-black text-white mt-3 block group-hover:text-primary transition-colors">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-neutral-950/40 border-b border-neutral-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary px-3.5 py-1">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Unified Business OS
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
              Features Built for Growth
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2.5xl mx-auto">
              Combine customer messaging with operations, invoicing, and white-label agency power in a single dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {features.map((feature, index) => (
              <FloatAnimation key={feature.id} delay={`${index * 0.08}s`}>
                <Card className={`h-full border bg-neutral-900/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-neutral-900/60 shadow-lg ${feature.bgColor} group`}>
                  <CardHeader className="p-7">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <feature.icon className={`w-6.5 h-6.5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold mt-5 text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-sm mt-3.5 text-[#9ea3b0] leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </FloatAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Shared Inbox Section */}
      <section className="py-24 bg-neutral-950/20 border-b border-neutral-900/60 relative overflow-hidden">
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest block font-mono">
                Shared Inbox
              </span>
              
              <h2 className="text-3xl sm:text-5.5xl font-black tracking-tight text-white leading-tight">
                Never drop a WhatsApp conversation again
              </h2>
              
              <p className="text-[#cbd5e1] text-sm sm:text-base leading-relaxed">
                Your whole team works from one inbox. Conversations can be assigned, tagged, and handed off without losing context. Real-time updates so two agents never reply to the same thread at the same time.
              </p>
              
              <ul className="space-y-4 pt-2">
                {[
                  "Assign threads to specific agents or round-robin across the team",
                  "Internal notes that only your team sees",
                  "Unread indicators so urgent replies never slip through",
                  "Deep-link into any conversation from the dashboard"
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right Inbox Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg rounded-2xl bg-[#090c10] border border-neutral-800 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col h-[380px]">
                {/* Mac Controls Header */}
                <div className="bg-[#0b141a] px-4 py-3 border-b border-neutral-900 flex items-center gap-2 select-none shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold font-mono ml-3">Inbox • ncwacrm</span>
                </div>
                
                {/* Inbox Body Grid (Sidebar + Chat Area) */}
                <div className="flex flex-1 min-h-0 bg-[#06080c]">
                  {/* Chat List Sidebar */}
                  <div className="w-1/3 border-r border-neutral-900 flex flex-col min-h-0 select-none">
                    <div className="p-2 border-b border-neutral-900 shrink-0">
                      <div className="rounded-lg bg-neutral-950 border border-neutral-850 px-2 py-1 text-[9px] text-slate-500 text-left">
                        Search conversations...
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {/* Active Chat: Aisha */}
                      <div className="rounded-lg bg-violet-500/10 border border-violet-500/25 p-2 text-left space-y-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-white font-sans">Aisha</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        </div>
                        <p className="text-[8px] text-[#cbd5e1] truncate font-sans">Thanks! Received it...</p>
                      </div>
                      
                      {/* Chat 2: Diego */}
                      <div className="rounded-lg p-2 text-left space-y-1 hover:bg-neutral-900/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-450 font-sans">Diego</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        </div>
                        <p className="text-[8px] text-slate-500 truncate font-sans">Do you ship to Brazil?</p>
                      </div>
                      
                      {/* Chat 3: Yuki */}
                      <div className="rounded-lg p-2 text-left space-y-1 hover:bg-neutral-900/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-450 font-sans">Yuki</span>
                        </div>
                        <p className="text-[8px] text-slate-500 truncate font-sans">Price sheet attached.</p>
                      </div>

                      {/* Chat 4: Luca */}
                      <div className="rounded-lg p-2 text-left space-y-1 hover:bg-neutral-900/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-450 font-sans">Luca</span>
                        </div>
                        <p className="text-[8px] text-slate-500 truncate font-sans">Got it, will test.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <div className="flex-1 flex flex-col min-h-0 bg-[#080a0f]">
                    {/* Header */}
                    <div className="px-4 py-2 border-b border-neutral-900 flex justify-between items-center shrink-0">
                      <div className="text-left select-none">
                        <span className="text-[10px] font-bold text-white block font-sans">Aisha</span>
                        <span className="text-[8px] text-slate-500 font-mono block">+44 7700 900123</span>
                      </div>
                      <span className="rounded bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[8px] font-bold text-violet-400 select-none">
                        ● Open
                      </span>
                    </div>
                    
                    {/* Message Log */}
                    <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5">
                      {/* Inbound Message */}
                      <div className="self-start bg-neutral-900 text-white text-[9.5px] max-w-[85%] px-3 py-2 rounded-xl rounded-tl-none border border-neutral-850 shadow-sm text-left font-sans">
                        <p className="leading-snug">Hi is the kit available in large?</p>
                      </div>
                      
                      {/* Outbound Message */}
                      <div className="self-end bg-[#6d28d9] text-white text-[9.5px] max-w-[85%] px-3 py-2 rounded-xl rounded-tr-none shadow-sm text-left font-sans">
                        <p className="leading-snug">Yes — shipping today 😉</p>
                      </div>
                      
                      {/* Inbound Message */}
                      <div className="self-start bg-neutral-900 text-white text-[9.5px] max-w-[85%] px-3 py-2 rounded-xl rounded-tl-none border border-neutral-850 shadow-sm text-left font-sans">
                        <p className="leading-snug">Thanks! Received it.</p>
                      </div>
                    </div>
                    
                    {/* Bottom Composer */}
                    <div className="p-2 border-t border-neutral-900 bg-neutral-950 flex items-center gap-2 shrink-0">
                      <div className="flex-1 rounded-lg bg-[#0e1117] border border-neutral-850 px-2.5 py-1.5 text-[9px] text-slate-500 text-left font-sans select-none">
                        Type a message...
                      </div>
                      <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center text-white cursor-pointer hover:bg-violet-500 transition-colors">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* No-Code Automations Section */}
      <section className="py-24 bg-[#0a0c10]/40 border-b border-neutral-900/60 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Flowchart Visual */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-md rounded-2xl bg-neutral-950/60 border border-neutral-850 p-6 shadow-2xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden">
                {/* Dot grid background for flowchart feeling */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
                
                {/* Flow Node 1 */}
                <div className="relative z-10 rounded-xl bg-[#090c10] border-l-4 border-blue-500 border-y border-r border-neutral-900 p-3 text-left space-y-1 max-w-[90%] mx-auto w-full">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-blue-400 uppercase tracking-widest font-mono select-none">
                    ⚡ Trigger
                  </div>
                  <h4 className="text-xs font-bold text-white">First message from contact</h4>
                </div>
                
                {/* Connector Arrow */}
                <div className="flex justify-center shrink-0 select-none">
                  <svg className="w-4 h-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Flow Node 2 */}
                <div className="relative z-10 rounded-xl bg-[#090c10] border-l-4 border-violet-500 border-y border-r border-neutral-900 p-3 text-left space-y-1 max-w-[90%] mx-auto w-full">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-violet-400 uppercase tracking-widest font-mono select-none">
                    ⚙️ Action
                  </div>
                  <h4 className="text-xs font-bold text-white">Send &quot;Hi! 👋 Thanks for reaching out.&quot;</h4>
                </div>
                
                {/* Connector Arrow */}
                <div className="flex justify-center shrink-0 select-none">
                  <svg className="w-4 h-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Flow Node 3 */}
                <div className="relative z-10 rounded-xl bg-[#090c10] border-l-4 border-slate-500 border-y border-r border-neutral-900 p-3 text-left space-y-1 max-w-[90%] mx-auto w-full">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono select-none">
                    ⏳ Wait
                  </div>
                  <h4 className="text-xs font-bold text-white">10 minutes</h4>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center shrink-0 select-none">
                  <svg className="w-4 h-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                </div>

                {/* Flow Node 4 */}
                <div className="relative z-10 rounded-xl bg-[#090c10] border-l-4 border-amber-500 border-y border-r border-neutral-900 p-3 text-left space-y-1 max-w-[90%] mx-auto w-full">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-amber-400 uppercase tracking-widest font-mono select-none">
                    ❓ Condition
                  </div>
                  <h4 className="text-xs font-bold text-white">If tag = &quot;lead&quot; → assign to sales</h4>
                </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest block font-mono">
                No-code Automations
              </span>
              
              <h2 className="text-3xl sm:text-5.5xl font-black tracking-tight text-white leading-tight">
                Automate the repetitive, focus on the humans
              </h2>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Build flows that react to WhatsApp events: welcome new contacts, chase unanswered replies, route leads by keyword. Conditions, waits, tags, deals — all with a visual builder that feels like Figma for workflows.
              </p>
              
              <ul className="space-y-4 pt-2">
                {[
                  "Triggers for new messages, contacts, tag changes, keywords, schedules",
                  "Actions: send template, add tag, create deal, webhook, and more",
                  "Conditional branches and wait steps for human-time delays",
                  "Per-run logs so you always know what ran and why"
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* Sales Pipelines Section */}
      <section className="py-24 bg-[#0a0c10]/40 border-b border-neutral-900/60 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest block font-mono">
                Sales Pipelines
              </span>
              
              <h2 className="text-3xl sm:text-5.5xl font-black tracking-tight text-white leading-tight">
                Turn conversations into revenue
              </h2>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Drag deals through custom stages, link them to contacts, and see exactly where revenue is getting stuck. Every deal keeps its WhatsApp thread one click away — so context never gets lost on a handoff.
              </p>
              
              <ul className="space-y-4 pt-2">
                {[
                  "Unlimited pipelines and stages",
                  "Kanban board with drag-and-drop",
                  "Deal value totals per stage and pipeline-wide",
                  "Linked contacts, conversations, and notes per deal"
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right Kanban Board */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg rounded-2xl bg-[#090c10] border border-neutral-800 p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 overflow-hidden h-[380px]">
                {/* Kanban Top Header */}
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3 shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-green-500/80" />
                    </div>
                    <span className="font-bold text-white text-[10px] ml-1 font-sans">Pipelines • ncwacrm</span>
                  </div>
                  <span className="text-[9px] rounded bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-violet-400 font-semibold font-sans">Active Sales</span>
                </div>
                
                {/* Board Columns Grid */}
                <div className="grid grid-cols-3 gap-2.5 overflow-y-auto select-none">
                  {/* Column 1: LEAD */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] text-slate-450 font-semibold px-1 font-sans">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> LEAD</span>
                      <span>2</span>
                    </div>
                    
                    <div className="rounded-xl bg-[#0e1117]/60 border border-neutral-900 p-2.5 text-left space-y-1 font-sans">
                      <h5 className="text-[9px] font-bold text-white">Acme Co</h5>
                      <span className="text-[8px] text-slate-400 block">$1,200</span>
                    </div>
                    
                    <div className="rounded-xl bg-[#0e1117]/60 border border-neutral-900 p-2.5 text-left space-y-1 font-sans">
                      <h5 className="text-[9px] font-bold text-white">Bakery on 3rd</h5>
                      <span className="text-[8px] text-slate-400 block">$450</span>
                    </div>
                  </div>
                  
                  {/* Column 2: PROPOSAL */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] text-slate-455 font-semibold px-1 font-sans">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> PROPOSAL</span>
                      <span>3</span>
                    </div>
                    
                    <div className="rounded-xl bg-[#0e1117]/60 border border-neutral-900 p-2.5 text-left space-y-1 relative font-sans">
                      <div className="flex justify-between items-center">
                        <h5 className="text-[9px] font-bold text-white">Nova Studios</h5>
                        <span className="text-[7px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded font-bold font-mono">hot</span>
                      </div>
                      <span className="text-[8px] text-slate-400 block">$4,000</span>
                    </div>
                    
                    <div className="rounded-xl bg-[#0e1117]/60 border border-neutral-900 p-2.5 text-left space-y-1 font-sans">
                      <h5 className="text-[9px] font-bold text-white">Rivera Hotel</h5>
                      <span className="text-[8px] text-slate-400 block">$2,100</span>
                    </div>

                    <div className="rounded-xl bg-[#0e1117]/60 border border-neutral-900 p-2.5 text-left space-y-1 font-sans">
                      <h5 className="text-[9px] font-bold text-white">Pine & Co</h5>
                      <span className="text-[8px] text-slate-400 block">$950</span>
                    </div>
                  </div>
                  
                  {/* Column 3: WON */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] text-slate-455 font-semibold px-1 font-sans">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> WON</span>
                      <span>1</span>
                    </div>
                    
                    <div className="rounded-xl bg-[#0e1117]/60 border border-neutral-905 p-2.5 text-left space-y-1 border-emerald-500/20 bg-emerald-500/5 font-sans">
                      <h5 className="text-[9px] font-bold text-white">Lagoon Spa</h5>
                      <span className="text-[8px] text-emerald-400 block font-bold">$3,200</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Real-Time Analytics Section */}
      <section className="py-24 bg-[#0a0c10]/40 border-b border-neutral-900/60 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Analytics Mockup */}
            <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-lg rounded-2xl bg-neutral-950/60 border border-neutral-850 p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 overflow-hidden h-[380px] text-left select-none">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-green-500/80" />
                    </div>
                    <span className="font-bold text-white text-[10px] ml-1 font-sans">Analytics • ncwacrm</span>
                  </div>
                  <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold font-sans">Live</span>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 shrink-0">
                  <div className="rounded-xl bg-[#090c10] border border-neutral-900 p-3 space-y-1">
                    <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider block font-sans">Open Convos</span>
                    <div className="flex items-baseline gap-1.5 font-sans">
                      <span className="text-base font-black text-white">42</span>
                      <span className="text-[7px] text-emerald-400 font-bold">▲ +5 today</span>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-[#090c10] border border-neutral-900 p-3 space-y-1">
                    <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider block font-sans">New Today</span>
                    <div className="flex items-baseline gap-1.5 font-sans">
                      <span className="text-base font-black text-white">18</span>
                      <span className="text-[7px] text-emerald-400 font-bold">▲ +3</span>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-[#090c10] border border-neutral-900 p-3 space-y-1">
                    <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider block font-sans">Avg Reply</span>
                    <div className="flex items-baseline gap-1.5 font-sans">
                      <span className="text-base font-black text-white">3.2m</span>
                      <span className="text-[7px] text-emerald-400 font-bold">▼ -0.4m</span>
                    </div>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div className="flex-1 rounded-xl bg-[#090c10] border border-neutral-900 p-4 flex flex-col justify-between min-h-0">
                  <div className="flex justify-between items-center shrink-0">
                    <span className="text-[8px] font-bold text-white font-sans">Conversations over time</span>
                    <div className="flex gap-3 text-[7px] text-slate-400 font-sans">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Incoming</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Outgoing</span>
                    </div>
                  </div>
                  
                  {/* SVG Line Graph Mockup */}
                  <div className="flex-1 flex items-end pt-3 relative">
                    <svg className="w-full h-full text-neutral-800" viewBox="0 0 100 40" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="10" x2="100" y2="10" stroke="#161b22" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#161b22" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="30" x2="100" y2="30" stroke="#161b22" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {/* Line 1 (Incoming: Violet) */}
                      <path d="M 0 35 Q 20 20 40 30 T 80 10 T 100 5" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
                      <path d="M 0 35 Q 20 20 40 30 T 80 10 T 100 5 L 100 40 L 0 40 Z" fill="url(#violet-gradient)" opacity="0.1" />
                      
                      {/* Line 2 (Outgoing: Cyan) */}
                      <path d="M 0 38 Q 20 28 40 34 T 80 15 T 100 8" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
                      <path d="M 0 38 Q 20 28 40 34 T 80 15 T 100 8 L 100 40 L 0 40 Z" fill="url(#cyan-gradient)" opacity="0.05" />
                      
                      <defs>
                        <linearGradient id="violet-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="cyan-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content */}
            <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-widest block font-mono">
                Real-Time Analytics
              </span>
              
              <h2 className="text-3xl sm:text-5.5xl font-black tracking-tight text-white leading-tight">
                See what is actually working
              </h2>
              
              <p className="text-slate-350 text-sm sm:text-base leading-relaxed">
                Response times, daily volume, pipeline value, and a cross-module activity feed. The dashboard tells you where attention is needed without you building a single chart.
              </p>
              
              <ul className="space-y-4 pt-2">
                {[
                  "Active conversations, new contacts, open deal value — live",
                  "Conversations over time for 7, 30, or 90 days",
                  "Average first-response time by weekday against your target",
                  "Activity feed merged across messages, deals, broadcasts, automations"
                ].map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 md:px-6 max-w-6xl mx-auto space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
            Process
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
            Live in under 30 minutes
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2.5xl mx-auto">
            Most teams are up and running before their first coffee refill. No onboarding calls required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6.5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            {/* Faint Background Number */}
            <span className="absolute right-4 top-4 text-7xl sm:text-8xl font-black text-neutral-900/40 select-none font-mono group-hover:text-primary/5 transition-colors">01</span>
            
            <div className="relative z-10 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 15.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5H18V5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v4.5H4.5C3.67 9.5 3 10.17 3 11v3c0 .83.67 1.5 1.5 1.5H6V18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2.5h1zM8 5h8v4.5H8V5zm8 13H8v-2.5h8V18zm-5-5H9v-1.5h2V13zm4 0h-2v-1.5h2V13z"/></svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Connect your WhatsApp number</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Paste your phone number ID and access token from Meta. Works with any Meta-approved WhatsApp Business API provider.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6.5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            {/* Faint Background Number */}
            <span className="absolute right-4 top-4 text-7xl sm:text-8xl font-black text-neutral-900/40 select-none font-mono group-hover:text-primary/5 transition-colors">02</span>
            
            <div className="relative z-10 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Bring in your contacts</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Import a CSV, or let incoming messages build your contact list automatically. Tags and custom fields are ready from day one.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0e1117]/60 border border-neutral-900 rounded-2xl p-6.5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            {/* Faint Background Number */}
            <span className="absolute right-4 top-4 text-7xl sm:text-8xl font-black text-neutral-900/40 select-none font-mono group-hover:text-primary/5 transition-colors">03</span>
            
            <div className="relative z-10 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Reply, automate, measure</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Use the shared inbox with your team, set up flows for repeat work, and track what&apos;s actually moving the needle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bangladesh business operations section */}
      <section id="integrations" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900/50 rounded-3xl p-8 sm:p-16 border border-neutral-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  Built for Bangladesh businesses
                </Badge>
                <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight text-white mb-6">
                  Bangladesh-ready <br/>
                  CRM operations
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
                  Manage conversations, contacts, campaigns, and automation in one workspace. Use the public API and webhooks to connect the Bangladesh-specific systems your business already uses.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                      <span className="font-semibold text-white block">Automated customer follow-ups</span>
                      <span className="text-sm text-muted-foreground">Create WhatsApp campaigns and scheduled reminders from saved templates.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                      <span className="font-semibold text-white block">Connect through API & webhooks</span>
                      <span className="text-sm text-muted-foreground">Integrate approved local billing, ERP, or payment services through a scoped implementation.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#080a0e] rounded-2xl p-6 sm:p-8 border border-neutral-900/80 shadow-xl relative">
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  Campaign activity snapshot
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground block">CAMPAIGN</span>
                      <span className="text-sm font-semibold text-white">Customer follow-up</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SENT</Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground block">AUDIENCE</span>
                      <span className="text-sm font-mono text-white">Tagged contacts</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground block">DELIVERY STATUS</span>
                      <span className="text-base font-bold text-white">Tracked in dashboard</span>
                    </div>
                    <span className="text-xs text-[#9ea3b0]">Meta template rules apply</span>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Broadcast via WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* White Label / Agency Section */}
      <section id="white-label" className="py-24 bg-neutral-950/20 border-t border-neutral-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-primary/5 rounded-2xl blur-[40px]" />
              <div className="bg-[#0e1117]/80 rounded-2xl p-8 border border-neutral-800 shadow-2xl relative">
                <div className="h-8 flex items-center justify-between border-b border-neutral-900 pb-4 mb-6">
                  <span className="text-xs font-semibold text-white">Agency White-Label Customization</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-[#9ea3b0]">Agency Domain (CNAME Mapping)</label>
                    <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-900 font-mono text-sm text-cyan-400">
                      crm.maajankiweb.com
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#9ea3b0]">SaaS Theme Branding</label>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded bg-primary border border-white/20" />
                      <div className="w-8 h-8 rounded bg-violet-600" />
                      <div className="w-8 h-8 rounded bg-emerald-500" />
                      <div className="w-8 h-8 rounded bg-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#9ea3b0]">Logo & Favicon</label>
                    <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-900 text-xs text-muted-foreground flex items-center justify-between">
                      <span>maajanki-logo.png</span>
                      <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px]">Loaded</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Badge variant="outline" className="mb-4 bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                <Layers className="w-3.5 h-3.5 mr-1" />
                Agencies & Resellers
              </Badge>
              <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight text-white mb-6">
                Start Your Own SaaS Business
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
                Empower your agency to sell WhatsApp CRM software to local clients under your own brand. Custom colors, domains, emails, and subscription billing. Agencies have full control over client setups and workspace allocations.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-900">
                  <Globe className="w-5 h-5 text-cyan-400 mb-2.5" />
                  <span className="font-semibold text-white block mb-1">Custom Domain</span>
                  <span className="text-xs text-muted-foreground">Map client workspaces to your brand domain seamlessly.</span>
                </div>
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-900">
                  <Globe className="w-5 h-5 text-cyan-400 mb-2.5" />
                  <span className="font-semibold text-white block mb-1">Brand Controls</span>
                  <span className="text-xs text-muted-foreground">Manage your agency identity and client workspace settings.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 bg-[#0a0c10] border-t border-neutral-900/60 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary px-3.5 py-1">
              Success Stories
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
              What our clients are saying
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2.5xl mx-auto">
              Read comments from clinic managers, e-commerce brands, and sales leaders.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5">
            {/* Card 1 */}
            <div className="bg-[#0c0f16]/40 border border-neutral-850 rounded-2xl p-7 flex flex-col justify-between hover:border-primary/20 transition-all duration-300 backdrop-blur-md group hover:-translate-y-1.5 shadow-lg text-left">
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-[#cbd5e1] text-xs leading-relaxed mb-6 font-medium italic">
                  &quot;Switching to <strong>N.C WaCRM</strong> automated our patient booking flow. Clients schedule check-ups directly on WhatsApp, and the AI resolves clinic FAQs instantly. Handovers to our front desk are perfectly seamless.&quot;
                </p>
              </div>
              <div className="border-t border-neutral-900/60 pt-4">
                <span className="font-bold text-white text-xs block">Dr. Tasnim Alam</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Clinic Operations Director • Aura Health Clinics</span>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="bg-[#0c0f16]/40 border border-neutral-850 rounded-2xl p-7 flex flex-col justify-between hover:border-primary/20 transition-all duration-300 backdrop-blur-md group hover:-translate-y-1.5 shadow-lg text-left">
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-[#cbd5e1] text-xs leading-relaxed mb-6 font-medium italic">
                  &quot;Our customer engagement rates skyrocketed with <strong>N.C WaCRM</strong>&apos;s automated order status and shipping alerts. Using the official WhatsApp Business API ensures we maintain a solid reputation and perfect compliance.&quot;
                </p>
              </div>
              <div className="border-t border-neutral-900/60 pt-4">
                <span className="font-bold text-white text-xs block">Tanvir Rahman</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Founder & CEO • CraftedThreads E-Commerce</span>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="bg-[#0c0f16]/40 border border-neutral-850 rounded-2xl p-7 flex flex-col justify-between hover:border-primary/20 transition-all duration-300 backdrop-blur-md group hover:-translate-y-1.5 shadow-lg text-left">
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-[#cbd5e1] text-xs leading-relaxed mb-6 font-medium italic">
                  &quot;<strong>N.C WaCRM</strong>&apos;s visual pipeline editor is custom-built for chat threads. We easily classify inbound leads, auto-assign tickets to support agents, and monitor drop-offs with absolute visual clarity.&quot;
                </p>
              </div>
              <div className="border-t border-neutral-900/60 pt-4">
                <span className="font-bold text-white text-xs block">Farhana Yasmin</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">Lead Product Owner • VentureScale SaaS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Client Component) */}
      <PricingSection />

      {/* FAQ Section (Pure CSS native HTML details accordions) */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Have questions about the CRM platform? We have answers.
            </p>
          </div>

          <div className="space-y-4.5">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border border-neutral-900 bg-[#0c0f16] rounded-xl transition-all duration-300 hover:border-neutral-800 open:border-primary/50 open:shadow [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="p-5.5 flex items-center justify-between gap-4 cursor-pointer list-none select-none">
                  <span className="text-base sm:text-lg text-white font-semibold">
                    {faq.question}
                  </span>
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 group-open:rotate-180 group-open:text-primary" />
                </summary>
                <div className="px-5.5 pb-5.5 pt-0 border-t border-neutral-900/60 mt-2">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-[#0a0c10] to-[#0c0e15] border-t border-neutral-900 relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-5.5xl font-black tracking-tight text-white leading-tight">
            Ready to Automate your WhatsApp?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2.5xl mx-auto">
            Get started in minutes. Connect your Meta Business account, setup your AI customer support workspace, and watch your business scale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 h-auto text-base font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xl shadow-emerald-500/10 gap-2 rounded-xl">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact-us">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 h-auto text-base font-semibold border-neutral-800 bg-[#121620]/45 hover:bg-[#151a26] text-white hover:text-white gap-2 rounded-xl">
                Contact Enterprise
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
