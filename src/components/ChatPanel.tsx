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

type Message = {
  id: string;
  role: string;
  text: string;
  at: number;
};

const STORAGE_KEY = "team_chat";

function load(): Message[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return [];
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function save(v: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

export function ChatPanel() {
  const [role, setRole] = useState<string>("Front Desk");
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>(() => load());
  const endRef = useRef<HTMLDivElement | null>(null);

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
    save(messages);
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      role: role,
      text: t,
      at: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
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
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Messages are shared across all departments (local demo).
            </div>
          </div>

          <div className="flex-1 border rounded-md p-3 overflow-y-auto bg-background/50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {m.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(m.at).toLocaleString()}
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