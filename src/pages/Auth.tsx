import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const navigate = useNavigate();
  const [demoRole, setDemoRole] = useState<string>("admin");

  // Map roles to dashboard paths
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

  // Demo mode handler
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[350px] pb-0 border shadow-md">
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
                Select your role to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Select Your Role</div>
                <div className="grid grid-cols-1 gap-3">
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
                  <Button onClick={handleEnterDemo} className="w-full neon-glow">
                    Enter Dashboard
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Demo mode - No authentication required. Data is stored locally or in Supabase if configured.
                </p>
              </div>
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