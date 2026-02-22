import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Send } from "lucide-react";

const ROLE_MAP: Record<string, string> = {
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

const TARGET_OPTIONS = [
  { value: "all", label: "Everyone (Broadcast)" },
  { value: "admin", label: "Admin" },
  { value: "front_desk", label: "Front Desk" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "security", label: "Security" },
  { value: "restaurant", label: "Restaurant" },
  { value: "inventory", label: "Inventory" },
  { value: "transport", label: "Transport" },
];

export function ChatPanel() {
  const { user } = useAuth();

  const getUserRole = (): string => {
    const userRole = (user as any)?.role as string | undefined;
    const demoRole = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;
    const effectiveRole = userRole || demoRole || "guest";
    return ROLE_MAP[effectiveRole] || "Staff";
  };

  const getEffectiveRoleKey = (): string => {
    const userRole = (user as any)?.role as string | undefined;
    const demoRole = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;
    return userRole || demoRole || "guest";
  };

  const role = getUserRole();
  const roleKey = getEffectiveRoleKey();
  const [text, setText] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const endRef = useRef<HTMLDivElement | null>(null);

  // Query messages filtered by target role (shows messages for this role + broadcasts)
  const messages = useQuery(api.chat.listMessages, { targetRole: filterRole === "all" ? undefined : filterRole });
  const sendMessage = useMutation(api.chat.sendMessage);

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
        targetRole: targetRole,
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

  function targetLabel(t: string) {
    return TARGET_OPTIONS.find(o => o.value === t)?.label || t;
  }

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[480px]">
          {/* Role badge + filter */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">Your Role:</span>
              <span className="text-sm font-semibold text-foreground">{role}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Filter:</span>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-7 text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages */}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {m.role}
                      </span>
                      {m.userName && (
                        <span className="text-xs text-muted-foreground">{m.userName}</span>
                      )}
                      {m.targetRole && m.targetRole !== "all" && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          → {targetLabel(m.targetRole)}
                        </Badge>
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

          {/* Send area */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Send to:</span>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message and press Enter..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button className="neon-glow shrink-0" onClick={send}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}