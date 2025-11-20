import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ChatPanel() {
  const { user } = useAuth();
  
  // Get user's actual role from auth or demo mode
  const getUserRole = (): string => {
    const userRole = (user as any)?.role as string | undefined;
    const demoRole = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;
    const effectiveRole = userRole || demoRole || "guest";
    
    // Map role to display name
    const roleMap: Record<string, string> = {
      admin: "Admin",
      front_desk: "Front Desk",
      housekeeping: "Housekeeping",
      restaurant: "Restaurant",
      security: "Security",
      maintenance: "Maintenance",
      transport: "Transport",
      inventory: "Inventory",
      guest: "Staff",
    };
    
    return roleMap[effectiveRole] || "Staff";
  };
  
  const role = getUserRole(); // Auto-detect role, no state needed
  const [text, setText] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const messages = useQuery(api.chat.listMessages);
  const sendMessage = useMutation(api.chat.sendMessage);

  const roles = useMemo(
    () => [
      "Admin",
      "Manager",
      "Front Desk",
      "Housekeeping",
      "Maintenance",
      "Security",
      "Restaurant",
      "Inventory",
      "Transport",
      "Staff",
    ],
    []
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  async function send() {
    const t = text.trim();
    if (!t) return;
    
    try {
      await sendMessage({
        role: role,
        text: t,
        userId: user?.email || undefined,
        userName: (user as any)?.full_name || user?.email || "Anonymous",
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[420px]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">Your Role:</span>
              <span className="text-sm font-semibold text-foreground">{role}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Real-time team communication across all departments.
            </div>
          </div>

          <div className="flex-1 border rounded-md p-3 overflow-y-auto bg-background/50">
            {!messages ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((m) => (
                  <div key={m._id} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {m.role}
                      </span>
                      {m.userName && (
                        <span className="text-xs text-muted-foreground">
                          {m.userName}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(m._creationTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm">
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Type a message and press Enter..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <Button className="neon-glow" onClick={send}>
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}