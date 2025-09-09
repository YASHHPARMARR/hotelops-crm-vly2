import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { applyThemeToDocument, cycleTheme, getTheme, setTheme, type AppTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

type PalettePreview = {
  key: AppTheme;
  name: string;
  description: string;
  swatches: string[];
};

const palettes: Array<PalettePreview> = [
  {
    key: "neon",
    name: "Neon Pulse",
    description: "Bold neon greens, pink accents, high contrast",
    swatches: ["#0f0", "#ff0080", "#111", "#1a1a1a", "#6ee7b7"],
  },
  {
    key: "ocean",
    name: "Ocean Blue",
    description: "Calm blues and teals, cool and minimal",
    swatches: ["#0ea5e9", "#22d3ee", "#0b1220", "#0f172a", "#7dd3fc"],
  },
  {
    key: "sunset",
    name: "Sunset Glow",
    description: "Warm ambers and corals with soft backgrounds",
    swatches: ["#f59e0b", "#fb7185", "#1a1410", "#2b1f1a", "#fbbf24"],
  },
];

export default function AdminSettings() {
  const [theme, setLocalTheme] = useState<AppTheme>("neon");

  useEffect(() => {
    const t = getTheme();
    setLocalTheme(t);
    applyThemeToDocument(t);
  }, []);

  const applyTheme = (t: AppTheme) => {
    setTheme(t);
    setLocalTheme(t);
    applyThemeToDocument(t);
    toast.success(`Theme applied: ${t}`);
  };

  const handleCycle = () => {
    const next = cycleTheme(theme);
    applyTheme(next);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">System preferences and appearance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Current theme: {theme}
            </Badge>
            <Button size="sm" className="neon-glow" onClick={handleCycle}>
              One-click Theme Toggle
            </Button>
          </div>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {palettes.map((p) => (
                <div
                  key={p.key}
                  className={`rounded-lg border border-border p-4 bg-card/50 ${theme === p.key ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    </div>
                    {theme === p.key ? (
                      <Badge className="bg-primary text-primary-foreground">Active</Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mb-4">
                    {p.swatches.map((c, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-md border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === p.key ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => applyTheme(p.key)}
                      className={theme === p.key ? "neon-glow" : ""}
                    >
                      {theme === p.key ? "Using" : "Apply"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Live preview without saving
                        applyThemeToDocument(p.key);
                        toast("Previewing theme", { description: p.name });
                      }}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: Use the One-click Theme Toggle to quickly switch between palettes anywhere.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}