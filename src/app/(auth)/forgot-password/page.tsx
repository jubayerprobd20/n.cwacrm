"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { AuthShowcase } from "@/components/auth/auth-showcase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen grid-cols-12 bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Decorative gradient for the whole page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Left panel: Product Showcase (visible on large screen) */}
      <AuthShowcase />

      {/* Right panel: Forgot Password Form */}
      <div className="flex flex-col justify-center items-center col-span-12 lg:col-span-6 xl:col-span-5 px-4 md:px-8 py-12 relative z-10">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Mobile Logo Header */}
          <div className="flex items-center gap-3 lg:hidden justify-center mb-2">
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
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold tracking-tight text-white leading-none">N.C WaCRM</span>
              <span className="text-[10px] text-indigo-400/80 mt-1 font-bold tracking-wider uppercase">Business OS</span>
            </div>
          </div>

          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl p-2 sm:p-4 rounded-2xl ring-1 ring-white/5">
            {success ? (
              <>
                <CardHeader className="items-center text-center pb-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Check your email
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="text-white font-semibold">{email}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    Please check your inbox. If the email doesn&apos;t arrive in a few minutes, check your spam folder.
                  </p>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full border-white/5 bg-slate-950/30 hover:bg-slate-950/60 hover:text-white text-slate-400 hover:border-white/10 rounded-xl"
                    >
                      Back to sign in
                    </Button>
                  </Link>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="items-center text-center pb-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Reset password
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">
                    Enter your email and we&apos;ll send you a reset link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleReset} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-white/5 bg-slate-950/40 text-white placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="mt-2 h-10 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all rounded-xl disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Sending...
                        </span>
                      ) : (
                        "Send reset link"
                      )}
                    </Button>
                  </form>

                  <Link
                    href="/login"
                    className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to sign in
                  </Link>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
