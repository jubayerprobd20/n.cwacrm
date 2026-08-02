"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, Building2, ArrowRight, Loader2, UsersRound } from "lucide-react";
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

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const supabase = createClient();

  // Step state: 'auth' | 'verify-email' | 'org'
  const [step, setStep] = useState<"auth" | "verify-email" | "org">("auth");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Org Fields
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [slugModified, setSlugModified] = useState(false);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reserved slugs list
  const RESERVED_SLUGS = ["app", "api", "www", "admin", "auth", "static"];

  // Redirect logic
  const redirectToDashboard = (slug: string) => {
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "localhost:3000";
    if (process.env.NODE_ENV === "development") {
      window.location.href = `${window.location.origin}/dashboard?org=${slug}`;
    } else {
      window.location.href = `https://${slug}.${mainDomain}/app/${slug}/dashboard`;
    }
  };

  // 1. Session check to redirect or show Org Creation step
  useEffect(() => {
    async function checkUserSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (inviteToken) {
          window.location.href = `/join/${encodeURIComponent(inviteToken)}`;
          return;
        }

        const { data: orgs } = await supabase
          .from("user_organizations")
          .select("organization_id, role, organizations(slug)")
          .eq("user_id", user.id);

        if (orgs && orgs.length > 0) {
          const orgData = orgs[0].organizations as
            | { slug: string }
            | { slug: string }[]
            | null;
          const firstOrgSlug = Array.isArray(orgData)
            ? orgData[0]?.slug
            : orgData?.slug;
          
          if (firstOrgSlug) {
            redirectToDashboard(firstOrgSlug);
          } else {
            setStep("org");
          }
        } else {
          setStep("org");
        }
      }
    }
    checkUserSession();
  }, [supabase, inviteToken, router]);

  // Helper to generate slug
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Handler for Org Name input change
  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrgName(val);
    if (!slugModified) {
      const generated = generateSlug(val);
      setOrgSlug(generated);
      validateSlug(generated);
    }
  };

  // Handler for Org Slug input change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugModified(true);
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setOrgSlug(val);
    validateSlug(val);
  };

  // Validate slug
  const validateSlug = (slug: string) => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!slug) {
      setSlugError("Slug is required");
      return;
    }

    if (slug.length < 3) {
      setSlugError("Slug must be at least 3 characters");
      return;
    }

    if (RESERVED_SLUGS.includes(slug)) {
      setSlugError("This slug is reserved and cannot be used");
      return;
    }

    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      setSlugError("Slug must contain only lowercase alphanumeric characters and hyphens.");
      return;
    }

    setSlugError(null);
    setSlugChecking(true);

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSlugError("This slug is already taken");
        } else {
          setSlugError(null);
        }
      } catch (err) {
        console.error("Error checking slug availability:", err);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
  };

  // Sign up via Email/Password
  const handleCredentialsSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const emailRedirectTo = inviteToken
      ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
      : `${window.location.origin}/auth/callback?next=/signup`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      if (inviteToken) {
        router.push(`/join/${encodeURIComponent(inviteToken)}`);
      } else {
        setStep("org");
      }
    } else {
      setStep("verify-email");
    }
    setLoading(false);
  };

  // Google OAuth Signup
  const handleGoogleSignup = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: inviteToken
          ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
          : `${window.location.origin}/auth/callback?next=/signup`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  // Organization Creation
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orgName) {
      setError("Organization name is required");
      return;
    }

    if (slugError || !orgSlug) {
      setError(slugError || "Invalid slug");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("create_organization_with_owner", {
        p_name: orgName,
        p_slug: orgSlug,
      });

      if (error) throw error;

      if (data && !data.success) {
        setError(data.message || "Failed to create organization");
        if (data.error === "slug_taken") {
          setSlugError("This slug is already taken");
        }
        setLoading(false);
        return;
      }

      redirectToDashboard(orgSlug);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-12 bg-slate-950 text-slate-100 overflow-x-hidden relative">
      {/* Decorative gradient for the whole page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Left panel: Product Showcase (visible on large screen) */}
      <AuthShowcase />

      {/* Right panel: Form Container */}
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
            {step === "auth" && (
              <>
                <CardHeader className="items-center text-center pb-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    {inviteToken ? (
                      <UsersRound className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    {inviteToken ? "Create account & join" : "Create account"}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">
                    {inviteToken
                      ? "Verify your details, then join your team workspace."
                      : "Get started with N.C WaCRM"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleCredentialsSignup} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="fullName" className="text-slate-300 text-xs font-semibold">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="border-white/5 bg-slate-950/40 text-white placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 rounded-xl"
                      />
                    </div>

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

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-white/5 bg-slate-950/40 text-white placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="confirmPassword" className="text-slate-300 text-xs font-semibold">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                          Creating account...
                        </span>
                      ) : (
                        "Create Account"
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
                    onClick={handleGoogleSignup}
                    className="w-full h-10 border-white/5 bg-slate-950/30 hover:bg-slate-950/60 hover:text-white text-slate-300 transition-all font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    Sign up with Google
                  </Button>

                  <p className="mt-6 text-center text-xs text-slate-400">
                    Already have an account?{" "}
                    <Link
                      href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardContent>
              </>
            )}

            {step === "verify-email" && (
              <>
                <CardHeader className="items-center text-center pb-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Check your inbox
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">
                    We&apos;ve sent a confirmation link to{" "}
                    <span className="text-white font-semibold">{email}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    {inviteToken
                      ? "Please click the link inside the email to verify, then accept the invitation."
                      : "Once you click the link inside the email, we will verify your session and prompt you to create your organization."}
                  </p>
                  <Link href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}>
                    <Button
                      variant="outline"
                      className="w-full border-white/5 bg-slate-950/30 hover:bg-slate-950/60 hover:text-white text-slate-400 hover:border-white/10 rounded-xl"
                    >
                      Back to sign in
                    </Button>
                  </Link>
                </CardContent>
              </>
            )}

            {step === "org" && (
              <>
                <CardHeader className="items-center text-center pb-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Setup your business
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm mt-1">
                    Create an organization to launch your CRM
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleCreateOrganization} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="orgName" className="text-slate-300 text-xs font-semibold">
                        Organization Name
                      </Label>
                      <Input
                        id="orgName"
                        type="text"
                        placeholder="Acme Corp"
                        value={orgName}
                        onChange={handleOrgNameChange}
                        required
                        className="border-white/5 bg-slate-950/40 text-white placeholder:text-slate-600 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="orgSlug" className="text-slate-300 text-xs font-semibold">
                          Workspace URL Slug
                        </Label>
                        {slugChecking && (
                          <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Checking...
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Input
                          id="orgSlug"
                          type="text"
                          placeholder="acme-corp"
                          value={orgSlug}
                          onChange={handleSlugChange}
                          required
                          className={`border-white/5 bg-slate-950/40 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500/20 rounded-xl ${
                            slugError 
                              ? "border-red-500/30 focus-visible:border-red-500" 
                              : orgSlug && !slugChecking 
                                ? "border-emerald-500/30 focus-visible:border-emerald-500" 
                                : "focus-visible:border-indigo-500"
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {typeof window !== "undefined" && window.location.origin.includes("localhost")
                          ? `Your URL: ${window.location.origin}/dashboard?org=${orgSlug || "acme-corp"}`
                          : `Your URL: https://${orgSlug || "acme-corp"}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN || "wacrm.nextcorebd.com"}/app/dashboard`
                        }
                      </p>
                      {slugError && (
                        <p className="text-xs text-red-400 mt-0.5 leading-tight">{slugError}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !!slugError || slugChecking || !orgSlug}
                      className="mt-4 h-10 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all rounded-xl disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating workspace...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          Launch Workspace
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
