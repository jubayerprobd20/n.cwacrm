"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
import { MessageSquare, UsersRound, Loader2 } from "lucide-react";
import { AuthShowcase } from "@/components/auth/auth-showcase";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// `useSearchParams` opts the component out of static prerendering
// unless it sits under a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const t = useTranslations("LoginPage");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (inviteToken) {
      window.location.href = `/join/${encodeURIComponent(inviteToken)}`;
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: inviteToken
          ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
          : `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-12 bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Decorative gradient for the whole page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Left panel: Product Showcase (visible on large screen) */}
      <AuthShowcase />

      {/* Right panel: Login Form */}
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
            <CardHeader className="items-center text-center pb-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                {inviteToken ? (
                  <UsersRound className="h-5 w-5 text-indigo-400" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                {inviteToken ? t('titleAccept') : t('titleWelcome')}
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm mt-1">
                {inviteToken ? t('descAccept') : t('descWelcome')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">
                    {t('emailLabel')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/5 bg-slate-950/40 text-white placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">
                      {t('passwordLabel')}
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      {t('signingIn')}
                    </span>
                  ) : (
                    t('signIn')
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#121827] px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-10 border-white/5 bg-slate-950/30 hover:bg-slate-950/60 hover:text-white text-slate-300 transition-all font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <GoogleIcon className="h-4 w-4" />
                Sign in with Google
              </Button>

              <p className="mt-6 text-center text-xs text-slate-400">
                {t('noAccount')}{" "}
                <Link
                  href={
                    inviteToken
                      ? `/signup?invite=${encodeURIComponent(inviteToken)}`
                      : "/signup"
                  }
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                >
                  {t('createAccount')}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
