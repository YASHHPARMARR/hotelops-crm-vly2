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

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabaseSignIn, supabaseSignOut, supabaseSignUp, getSupabaseUserEmail } from "@/lib/supabaseClient";
import { getSupabase } from "@/lib/supabaseClient";
import { getSupabaseInitStatus, normalizeSupabaseError } from "@/lib/supabaseClient";

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
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [sbEmail, setSbEmail] = useState("");
  const [sbPassword, setSbPassword] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string | null>(null);
  const [sbConnected, setSbConnected] = useState<boolean>(false);
  const [sbStatusText, setSbStatusText] = useState<string>("");

  function refreshSbStatus() {
    try {
      const status = getSupabaseInitStatus();
      const parts: string[] = [];
      parts.push(`SDK: ${status.missing.sdk ? "missing" : "ok"}`);
      parts.push(`URL: ${status.missing.url ? "missing" : "ok"}`);
      parts.push(`Anon Key: ${status.missing.anon ? "missing" : "ok"}`);
      setSbStatusText(parts.join(" • "));
      setSbConnected(!!getSupabase());
    } catch {
      setSbStatusText("Unable to read Supabase status");
      setSbConnected(false);
    }
  }

  useEffect(() => {
    refreshSbStatus();
  }, []);

  const roleToPath: Record<string, string> = {
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

  async function getRoleRedirect(): Promise<string> {
    // 1) Supabase staff role by email
    try {
      const email = await getSupabaseUserEmail();
      const s = getSupabase();
      if (s && email) {
        const { data } = await s.from("staff").select("role").eq("email", email).limit(1).maybeSingle();
        const staffRole = data?.role as string | undefined;
        if (staffRole && roleToPath[staffRole]) return roleToPath[staffRole];
      }
    } catch { /* ignore */ }
    // 2) demoRole if set
    const demoRole = localStorage.getItem("demoRole") || undefined;
    if (demoRole && roleToPath[demoRole]) return roleToPath[demoRole];
    // 3) fallback
    return "/";
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
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

      const dest = redirectAfterAuth || (await getRoleRedirect());
      navigate(dest);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGuestLoginWithRole = async (role: keyof typeof roleToPath) => {
    setIsLoading(true);
    setError(null);
    try {
      // Do NOT sign in; enable demo mode via localStorage
      localStorage.setItem("demoRole", role);
      const dest = roleToPath[role] || "/";
      // Navigate directly to the chosen dashboard
      navigate(dest);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to continue as guest: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Default to guest dashboard for quick explore
      localStorage.setItem("demoRole", "guest");
      const redirect = redirectAfterAuth || roleToPath["guest"] || "/";
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to continue as guest: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
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
                    
                    {!showRolePicker ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setShowRolePicker(true)}
                        disabled={isLoading}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Continue as Guest (Choose Role)
                      </Button>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs text-muted-foreground mb-2">Select a role to explore:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("admin")} disabled={isLoading}>Admin</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("front_desk")} disabled={isLoading}>Front Desk</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("housekeeping")} disabled={isLoading}>Housekeeping</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("restaurant")} disabled={isLoading}>Restaurant</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("security")} disabled={isLoading}>Security</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("maintenance")} disabled={isLoading}>Maintenance</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("transport")} disabled={isLoading}>Transport</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("inventory")} disabled={isLoading}>Inventory</Button>
                          <Button variant="secondary" onClick={() => handleGuestLoginWithRole("guest")} disabled={isLoading} className="col-span-2">Guest</Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowRolePicker(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Use Supabase Email/Password</div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setUseSupabase((v) => !v)}>
                        {useSupabase ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {useSupabase && (
                      <div className="mt-3 space-y-2">
                        <Input
                          placeholder="email@domain.com"
                          type="email"
                          value={sbEmail}
                          onChange={(e) => setSbEmail(e.target.value)}
                          disabled={isLoading}
                        />
                        <Input
                          placeholder="Password"
                          type="password"
                          value={sbPassword}
                          onChange={(e) => setSbPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            className="flex-1"
                            disabled={isLoading || !sbEmail || !sbPassword}
                            onClick={async () => {
                              setIsLoading(true);
                              setError(null);
                              try {
                                await supabaseSignUp(sbEmail, sbPassword);
                                await supabaseSignIn(sbEmail, sbPassword);
                                const email = await getSupabaseUserEmail();
                                if (!email) throw new Error("Signed in but no Supabase user email found.");
                                const dest = redirectAfterAuth || (await getRoleRedirect());
                                navigate(dest);
                                localStorage.removeItem("demoRole");
                              } catch (e: any) {
                                console.error(e);
                                setError(e?.message || "Signup failed");
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                          >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign up
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            disabled={isLoading || !sbEmail || !sbPassword}
                            onClick={async () => {
                              setIsLoading(true);
                              setError(null);
                              try {
                                await supabaseSignIn(sbEmail, sbPassword);
                                const email = await getSupabaseUserEmail();
                                if (!email) throw new Error("Signed in but no Supabase user email found.");
                                const dest = redirectAfterAuth || (await getRoleRedirect());
                                navigate(dest);
                                localStorage.removeItem("demoRole");
                              } catch (e: any) {
                                console.error(e);
                                setError(e?.message || "Login failed");
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                          >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Log in
                          </Button>
                        </div>
                        <div className="mt-4 rounded-md border border-border/60 bg-muted/30 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-muted-foreground">Supabase Debug</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDebugOpen((v) => !v);
                                if (!debugOpen) refreshSbStatus();
                              }}
                            >
                              {debugOpen ? "Hide" : "Show"}
                            </Button>
                          </div>
                          {debugOpen && (
                            <div className="mt-2 space-y-2 text-xs">
                              <div className="flex flex-col gap-1">
                                <div>Status: {sbStatusText || "Unknown"}</div>
                                <div>Client: {sbConnected ? "initialized" : "not initialized"}</div>
                                {sessionInfo ? <div className="text-muted-foreground break-words">{sessionInfo}</div> : null}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      const s = getSupabase();
                                      if (!s) {
                                        setSessionInfo("No client. Go to Admin → Settings to configure URL and Anon key.");
                                        return;
                                      }
                                      const { data, error } = await s.auth.getSession();
                                      if (error) throw error;
                                      const email = (await s.auth.getUser()).data?.user?.email ?? "none";
                                      setSessionInfo(
                                        `Session: ${data?.session ? "present" : "absent"} • Email: ${email}`
                                      );
                                    } catch (e: any) {
                                      setSessionInfo(`Session check failed: ${normalizeSupabaseError(e)}`);
                                    } finally {
                                      refreshSbStatus();
                                    }
                                  }}
                                >
                                  Check session
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    refreshSbStatus();
                                  }}
                                >
                                  Recheck status
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="neon-glow"
                                  onClick={() => {
                                    // Navigate to Admin Settings for keys and SQL
                                    navigate("/admin/settings");
                                  }}
                                >
                                  Open Admin Settings
                                </Button>
                              </div>
                              <div className="text-muted-foreground">
                                • If SDK/URL/Anon show "missing", set keys in Admin → Settings, then return here.
                                <br />
                                • If tables are missing on other pages, use that page's "Copy SQL to create &lt;table&gt;" then Refresh.
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          disabled={isLoading}
                          onClick={async () => {
                            setIsLoading(true);
                            setError(null);
                            try {
                              await supabaseSignOut();
                              setSbEmail("");
                              setSbPassword("");
                            } catch (e: any) {
                              setError(e?.message || "Logout failed");
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          Log out of Supabase
                        </Button>
                      </div>
                    )}
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
                  <input type="hidden" name="code" value={otp} />

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
                      onClick={() => setStep("signIn")}
                    >
                      Try again
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