import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/convex/schema";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const { isAuthenticated, user } = useAuth();
  
  // OTP flow state
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo mode state
  const [demoRole, setDemoRole] = useState<string>("guest");

  // Redirect authenticated users to guest dashboard
  if (isAuthenticated && user) {
    navigate("/guest");
    return null;
  }

  // OTP handlers
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      await signIn("email-otp", { email: email.trim() });
      setStep({ email: email.trim() });
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      console.error("Failed to send code:", error);
      toast.error(error?.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const stepEmail = typeof step === "object" ? step.email : email;
      await signIn("email-otp", { email: stepEmail, code: code.trim() });
      
      toast.success("Verified! Redirecting to your dashboard...");
      
      setTimeout(() => {
        navigate("/guest");
      }, 500);
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(error?.message || "Invalid verification code");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("signIn");
    setCode("");
  };

  // Demo mode handler
  const handleDemoLogin = () => {
    if (!demoRole) {
      toast.error("Please select a role");
      return;
    }

    localStorage.setItem("demoRole", demoRole);
    toast.success(`Entering as ${demoRole.replace("_", " ")} (Demo Mode)`);
    
    const rolePathMap: Record<string, string> = {
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

    navigate(rolePathMap[demoRole] || "/guest");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[400px] pb-0 border shadow-md">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <img
                  src="./logo.svg"
                  alt="Logo"
                  width={64}
                  height={64}
                  className="rounded-lg mb-4 mt-4 cursor-pointer"
                  onClick={() => navigate("/")}
                />
              </div>
              <CardTitle className="text-xl">Welcome to HotelOps CRM</CardTitle>
              <CardDescription>
                Sign in with OTP or use demo mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="otp" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="otp">OTP Login</TabsTrigger>
                  <TabsTrigger value="demo">Demo Mode</TabsTrigger>
                </TabsList>

                {/* OTP Login Tab */}
                <TabsContent value="otp" className="space-y-4">
                  {typeof step === "object" ? (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                          id="code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          maxLength={6}
                          autoComplete="off"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Code sent to {step.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 neon-glow"
                        >
                          {isLoading ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSendCode} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full neon-glow"
                      >
                        {isLoading ? "Sending..." : "Send Verification Code"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        A verification code will be sent to your email
                      </p>
                    </form>
                  )}
                </TabsContent>

                {/* Demo Mode Tab */}
                <TabsContent value="demo" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-role">Select Role</Label>
                    <Select value={demoRole} onValueChange={setDemoRole}>
                      <SelectTrigger id="demo-role">
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                        <SelectItem value={ROLES.FRONT_DESK}>Front Desk</SelectItem>
                        <SelectItem value={ROLES.HOUSEKEEPING}>Housekeeping</SelectItem>
                        <SelectItem value={ROLES.RESTAURANT}>Restaurant</SelectItem>
                        <SelectItem value={ROLES.SECURITY}>Security</SelectItem>
                        <SelectItem value={ROLES.MAINTENANCE}>Maintenance</SelectItem>
                        <SelectItem value={ROLES.TRANSPORT}>Transport</SelectItem>
                        <SelectItem value={ROLES.INVENTORY}>Inventory</SelectItem>
                        <SelectItem value={ROLES.GUEST}>Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleDemoLogin}
                    className="w-full neon-glow"
                  >
                    Enter Dashboard (Demo)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Demo mode allows quick access without authentication
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>

            <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
              Powered by{" "}
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
  return <Auth {...props} />;
}