import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getSupabaseUserEmail } from "@/lib/supabaseClient";
import { getSupabase } from "@/lib/supabaseClient";
import { normalizeSupabaseError } from "@/lib/supabaseClient";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);

  // Add: resend and redirect override state
  const [resending, setResending] = useState(false);

  // Add: demo role selection state
  const [demoRole, setDemoRole] = useState<string>("admin");

  // Map roles to dashboard paths for both demo mode and post-auth redirects
  const ROLE_TO_PATH: Record<string, string> = {
    admin: "/admin",
    front_desk: "/front-desk",
    housekeeping: "/housekeeping",
    restaurant: "/restaurant",
    security: "/security",
    maintenance: "/maintenance",
    transport: "/transport",
    inventory: "/inventory",
    guest: "/guest",
  };

  // Add a helper to upsert the user into guests table (safe, optional)
  async function upsertGuest(email: string) {
    try {
      const s = getSupabase();
      if (!s) return;
      // Try 'guests' first
      const { error: e1 } = await s
        .from("guests")
        .upsert({ email, created_at: new Date().toISOString() }, { onConflict: "email" });
      if (!e1) return;

      // Fallback to 'guest' if 'guests' table doesn't exist
      await s
        .from("guest")
        .upsert({ email, created_at: new Date().toISOString() }, { onConflict: "email" });
    } catch {
      // ignore if tables don't exist or RLS blocks
    }
  }

  // Add: safe upsert into Supabase 'users' table (optional, RLS permitting)
  async function upsertUser(email: string) {
    try {
      const s = getSupabase();
      if (!s) return;
      await s
        .from("users")
        .upsert({ email, created_at: new Date().toISOString() }, { onConflict: "email" });
    } catch {
      // ignore if table doesn't exist or RLS blocks
    }
  }

  // Add: safe upsert into Supabase 'accounts' table with default role 'guest'
  async function upsertAccount(email: string) {
    try {
      const s = getSupabase();
      if (!s) return;
      await s
        .from("accounts")
        .upsert(
          { email, password: null, role: "guest", created_at: new Date().toISOString() },
          { onConflict: "email" },
        );
    } catch {
      // ignore if table doesn't exist or RLS blocks
    }
  }

  // Update getRoleRedirect to be used for post-auth navigation
  async function getRoleRedirect(): Promise<string> {
    const roleToPath = ROLE_TO_PATH;
    try {
      const email = await getSupabaseUserEmail();
      const s = getSupabase();
      if (s && email) {
        // Change: Check 'accounts' table for role
        const { data } = await s
          .from("accounts")
          .select("role")
          .eq("email", email)
          .limit(1)
          .maybeSingle();
        const role = data?.role as string | undefined;
        if (role && roleToPath[role]) return roleToPath[role];
      }
    } catch { /* ignore */ }

    // If no role, default to guest dashboard
    return "/guest";
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      (async () => {
        try {
          const email = await getSupabaseUserEmail();
          if (email) {
            try { localStorage.setItem("DEMO_USER_EMAIL", email); } catch {}
            await upsertGuest(email);
            await upsertUser(email);
            // Add: ensure an account row exists
            await upsertAccount(email);
          }
        } catch {}
        const dest = await getRoleRedirect();
        navigate(dest);
      })();
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  // Add: enter demo handler
  const handleEnterDemo = () => {
    try {
      if (!demoRole) return;
      localStorage.setItem("demoRole", demoRole);
      const dest = ROLE_TO_PATH[demoRole] || "/";
      navigate(dest);
    } catch {
      navigate("/");
    }
  };

  // Add: resend OTP handler
  const handleResendCode = async () => {
    if (typeof step !== "object") return;
    setResending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", step.email);
      await signIn("email-otp", formData);
      setSessionInfo("A new verification code has been sent.");
    } catch (e: any) {
      setError(e?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      const email = formData.get("email") as string;
      setStep({ email });

      try { localStorage.setItem("DEMO_USER_EMAIL", email); } catch {}
      // Optional: upsert record early
      await upsertGuest(email);
      await upsertUser(email);
      // Add: upsert into accounts with default role guest
      await upsertAccount(email);

      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      const email = formData.get("email") as string;
      try { localStorage.setItem("DEMO_USER_EMAIL", email); } catch {}
      await upsertGuest(email);
      await upsertUser(email);
      // Add: upsert into accounts with default role guest
      await upsertAccount(email);

      const dest = await getRoleRedirect();
      navigate(dest);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      
      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
        <Card className="min-w-[350px] pb-0 border shadow-md">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center">
              <div className="flex justify-center">
                    <img
                      src="./logo.svg"
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                <CardTitle className="text-xl">Get Started</CardTitle>
                <CardDescription>
                  Enter your email to log in or sign up
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-9"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Use the email form above to receive a one-time code.
                    </p>
                  </div>

                  {/* Add: Demo Mode quick access */}
                  <div className="mt-6 border rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Continue in Demo Mode</div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
                      <Select value={demoRole} onValueChange={setDemoRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="front_desk">Front Desk</SelectItem>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="secondary" onClick={handleEnterDemo}>
                        Enter Demo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Skips login and opens the selected dashboard using demo data (local storage or Supabase fallback).
                    </p>
                  </div>

                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  We've sent a code to {step.email}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="token" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          // Find the closest form and submit it
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Didn't receive a code?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={handleResendCode}
                      disabled={resending || isLoading}
                    >
                      {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend code"}
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Use different email
                  </Button>
                </CardFooter>
              </form>
            </>
          )}

          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            Secured by{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              vly.ai
            </a>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}