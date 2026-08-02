"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Bot, Check, ArrowRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
  isInteractive?: boolean;
  buttons?: string[];
  paymentLink?: boolean;
}

export function ChatbotSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Hello! Welcome to N.C WaCRM Concierge. How can I help your business grow today?",
      time: "10:00 AM",
      isInteractive: true,
      buttons: ["💬 Try AI Auto-Reply", "💳 Send Payment Link", "📅 Book Appointment"]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleAction = (action: string) => {
    // Add user message
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: action, time: userTime }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let botResponse: Message = { sender: "bot", text: "", time: botTime };

      if (action.includes("AI Auto-Reply")) {
        botResponse.text = "🤖 [AI Engine]: Our system queries your connected knowledge base in under 200ms. Here is your answer:\n\n'N.C WaCRM integrates directly with the official Meta Cloud API, protecting your numbers from ban risks. Auto-replies are trained on your product sheets.'";
      } else if (action.includes("Payment Link")) {
        botResponse.text = "💳 [Payment Gateway]: Generated VAT-compliant payment link for invoice #INV-4921:\n\n*Amount:* ৳2,999.00\n*Link:* pay.nextcorebd.com/inv-4921";
        botResponse.paymentLink = true;
      } else if (action.includes("Book Appointment")) {
        botResponse.text = "📅 [Calendar Sync]: I found 3 available slots for a 1-on-1 strategy call tomorrow:\n\n1. 11:00 AM BST\n2. 02:30 PM BST\n3. 04:00 PM BST\n\nPlease select a slot number.";
        botResponse.isInteractive = true;
        botResponse.buttons = ["Slot 1: 11:00 AM", "Slot 2: 02:30 PM", "Slot 3: 04:00 PM"];
      } else if (action.includes("Slot")) {
        botResponse.text = `🎉 Appointment confirmed! A Google Calendar invite and WhatsApp reminder have been scheduled for ${action.split(":")[1]}. See you then!`;
      } else {
        botResponse.text = "I'm here to assist you! Feel free to pick another action below:";
        botResponse.isInteractive = true;
        botResponse.buttons = ["💬 Try AI Auto-Reply", "💳 Send Payment Link", "📅 Book Appointment"];
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-neutral-800 bg-[#0d0f16]/90 shadow-2xl backdrop-blur-xl flex flex-col h-[520px] relative">
      {/* Top Header Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">N.C WaCRM AI Concierge</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-muted-foreground">Demo Chatbot Simulator</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] bg-neutral-950 border-neutral-800 text-emerald-400 font-bold uppercase tracking-wider">
          Live Play
        </Badge>
      </div>

      {/* Message History area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-950/40 via-[#0a0c10] to-[#0a0c10] select-text">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase font-mono px-1">
              {msg.sender === "user" ? <User className="w-3 h-3 text-primary" /> : <Bot className="w-3 h-3 text-emerald-400" />}
              {msg.sender === "user" ? "You" : "N.C WaCRM Bot"}
            </div>
            <div
              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] shadow-md whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-neutral-900 border border-neutral-800 text-white"
              }`}
            >
              {msg.text}
              
              {/* Payment Link Card Mockup */}
              {msg.paymentLink && (
                <div className="mt-4 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-[10px]">
                      ৳
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block leading-none">bKash / Card Link</span>
                      <span className="text-xs font-bold text-white mt-1 block">invoice_4921</span>
                    </div>
                  </div>
                  <a href="/login" className="px-3 py-1.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold text-[10px] hover:bg-emerald-400 transition-all flex items-center gap-1">
                    Pay Now <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            <span className="text-[8px] text-muted-foreground px-1">{msg.time}</span>

            {/* Quick replies/buttons under the bot message */}
            {msg.isInteractive && msg.buttons && (
              <div className="flex flex-col gap-2 pt-2.5 w-full max-w-[85%]">
                {msg.buttons.map((btn, btnIdx) => (
                  <button
                    key={btnIdx}
                    onClick={() => handleAction(btn)}
                    className="w-full text-left px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:bg-neutral-900 text-xs font-bold text-emerald-400 hover:text-white transition-all duration-200 cursor-pointer flex justify-between items-center group shadow-sm"
                  >
                    {btn}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase font-mono px-1">
              <Bot className="w-3 h-3 text-emerald-400" />
              N.C WaCRM Bot
            </div>
            <div className="rounded-2xl px-4 py-3 bg-neutral-900 border border-neutral-800 text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar Placeholder */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center gap-3 shrink-0">
        <input
          type="text"
          disabled
          placeholder="Click buttons above to simulate chat..."
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-muted-foreground focus:outline-none"
        />
        <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-muted-foreground shadow">
          ✓
        </div>
      </div>
    </div>
  );
}
