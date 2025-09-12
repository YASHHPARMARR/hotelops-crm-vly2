import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase, getSupabase } from "@/lib/supabaseClient";

type Column = {
  key: string;
  label: string;
  input?: "text" | "number" | "date" | "select" | "textarea";
  options?: { label: string; value: string }[];
  required?: boolean;
  widthClass?: string;
};

type CrudPageProps = {
  title: string;
  storageKey: string;
  columns: Column[];
  seed: Record<string, any>[];
  actions?: Array<"add" | "edit" | "delete">;
  description?: string;
  backend?: "local" | "supabase";
  table?: string;
  ownerField?: string;
  ownerValue?: string | undefined;
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function CrudPage(props: CrudPageProps) {
  const {
    title,
    storageKey,
    columns,
    seed,
    actions = ["add", "edit", "delete"],
    description,
    backend = "local",
    table,
    ownerField,
    ownerValue,
  } = props;

  const demoOwner = !!ownerField && ownerValue === "demo@example.com";

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Record<string, any>[]>(() => {
    if (backend === "supabase" && supabase && table) {
      // defer to fetch effect; show empty first render
      return [];
    }
    const loaded = loadLocal<Record<string, any>[]>(storageKey, []);
    if (loaded.length > 0) return loaded;
    saveLocal(storageKey, seed);
    return seed;
  });
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const selectColumns = useMemo(
    () => columns.filter((c) => c.input === "select" && c.options && c.options.length > 0),
    [columns],
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  // Track if we've already attempted seeding to avoid duplicates
  const hasSeededRef = useRef(false);

  // Add: table missing flag to guide users to create the table quickly
  const [missingTable, setMissingTable] = useState(false);

  // Add: request state flags to prevent duplicate submissions and provide UI feedback
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Add: helper to generate CREATE TABLE SQL for the current grid
  function generateCreateTableSql() {
    if (!table) return "";
    const mapType = (input?: Column["input"]) => {
      switch (input) {
        case "number":
          return "numeric";
        case "date":
          return "date";
        case "textarea":
        case "select":
        case "text":
        default:
          return "text";
      }
    };
    const fieldLines: string[] = [];
    fieldLines.push(`id text primary key`);
    for (const c of columns) {
      // avoid duplicate id if user included "id" in columns schema
      if (c.key === "id") continue;
      fieldLines.push(`${c.key} ${mapType(c.input)}`);
    }
    if (ownerField) {
      fieldLines.push(`${ownerField} text`);
    }
    fieldLines.push(`created_at timestamptz default now()`);
    return [
      `create table if not exists ${table} (`,
      `  ${fieldLines.join(",\n  ")}`,
      `);`,
    ].join("\n");
  }

  // Add: central fetch function for Supabase, used on mount, after writes, and by polling/Refresh
  async function fetchRows() {
    if (backend !== "supabase" || !table) return;
    const check = await ensureSupabaseReady(false);
    if (!check.ok || !check.s) return;
    try {
      setRefreshing(true);
      setMissingTable(false); // reset before attempt
      let query = check.s.from(table).select("*");
      if (ownerField && ownerValue) {
        query = query.eq(ownerField, ownerValue);
      }
      const { data, error } = await query;
      if (error) {
        // Mark table-missing for helpful UI if 404/PGRST204 or message says not found
        const code = (error as any)?.code ?? (error as any)?.status;
        const m = String((error as any)?.message || "").toLowerCase();
        if (code === "PGRST204" || code === 404 || m.includes("not found")) {
          setMissingTable(true);
        }
        const msg = parseSupabaseError(error);
        toast.error(`Fetch failed: ${msg}`);
        console.error("Supabase fetch error:", error);
        return;
      }
      if (Array.isArray(data)) {
        setRows(data);
      }
    } catch (e: any) {
      console.error("Fetch failed:", e);
      const msg = parseSupabaseError(e);
      // Detect table missing on thrown errors too
      const code = e?.code ?? e?.status;
      const m = String(e?.message || "").toLowerCase();
      if (code === "PGRST204" || code === 404 || m.includes("not found")) {
        setMissingTable(true);
      }
      toast.error(`Fetch failed: ${msg}`);
    } finally {
      setRefreshing(false);
    }
  }

  // Add: connection/session helpers
  async function ensureSupabaseReady(requireAuth: boolean) {
    const s = getSupabase();
    if (!s) {
      toast.error("Supabase not initialized. Set URL and Anon Key in Admin → Settings, then reload.");
      return { ok: false as const, s: undefined, session: undefined };
    }
    let session: any | undefined = undefined;
    try {
      const res = await s.auth.getSession();
      session = res?.data?.session;
    } catch (e) {
      // ignore
    }
    if (requireAuth && !session) {
      toast.error("Supabase login required. Use Email/Password on the Auth page.");
      return { ok: false as const, s, session: undefined };
    }
    return { ok: true as const, s, session };
  }

  // Add: normalize Supabase errors into human-readable messages
  function parseSupabaseError(err: any): string {
    const code = err?.code || err?.status || err?.name;
    const message = err?.message || err?.hint || err?.details || "Unknown error";
    if (typeof message === "string" && message.toLowerCase().includes("fetch failed")) {
      return "Network error. Check your connection.";
    }
    if (code === "42501" || /rls|row level security|permission/i.test(String(message))) {
      return "Permission denied by RLS. Ensure you are logged in (Auth page) or using demo owner.";
    }
    if (code === "PGRST116" || /duplicate key/i.test(String(message))) {
      return "Duplicate ID detected. Try again.";
    }
    if (code === "PGRST204" || code === 404) {
      return "Table or route not found. Verify tables are created in Supabase.";
    }
    if (code === "429" || /rate limit/i.test(String(message))) {
      return "Rate limited. Please slow down and try again.";
    }
    if (code === "401" || /unauthorized|auth/i.test(String(message))) {
      return "Unauthorized. Please login via the Auth page.";
    }
    return message;
  }

  useEffect(() => {
    let unsubscribed = false;
    if (backend !== "supabase" || !table) return;

    const s = getSupabase();
    if (!s) return;

    // Initial fetch (replaced with central fetch)
    fetchRows().then(async () => {
      if (unsubscribed) return;
      // Auto-seed if table is empty and we have seed rows
      try {
        // Only seed if table is empty AND no owner scoping or ownerValue provided
        // Seeding global demo rows when scoping by user would be misleading
        if (ownerField && ownerValue) return;

        const { data: current } = await s.from(table).select("id").limit(1);
        const isEmpty = !Array.isArray(current) || current.length === 0;
        if (isEmpty && Array.isArray(seed) && seed.length > 0 && !hasSeededRef.current) {
          hasSeededRef.current = true;
          const payload = seed.map((r) => (r.id ? r : { id: crypto.randomUUID(), ...r }));
          const { error: insertErr } = await s.from(table).insert(payload);
          if (insertErr) {
            console.error("Supabase seed insert error:", insertErr);
          } else {
            setRows(payload);
            toast.success("Sample data added");
          }
        }
      } catch (e) {
        console.error("Seed check failed:", e);
      }
    });

    // Realtime subscription is optional; if Realtime not enabled, it simply won't receive events
    const channel = s
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          setRows((prev) => {
            const newRow = payload.new as Record<string, any>;
            const oldRow = payload.old as Record<string, any>;
            const id = (newRow?.id ?? oldRow?.id) as string | number | undefined;
            if (!id) return prev;

            if (payload.eventType === "INSERT") {
              if (prev.some((r) => r.id === newRow.id)) return prev;
              return [newRow, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((r) => (r.id === newRow.id ? { ...r, ...newRow } : r));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((r) => r.id !== oldRow.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      unsubscribed = true;
      getSupabase()?.removeChannel(channel);
    };
  }, [backend, table, seed, ownerField, ownerValue]);

  // Add: polling refetch every 5s to keep other pages in sync without Realtime
  useEffect(() => {
    if (backend !== "supabase" || !table) return;
    const interval = setInterval(() => {
      fetchRows();
    }, 5000);
    return () => clearInterval(interval);
  }, [backend, table]);

  useEffect(() => {
    if (backend === "local") {
      saveLocal(storageKey, rows);
    }
  }, [storageKey, rows, backend]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasFilters = Object.values(filters).some((v) => v && v !== "__ALL__");
    return rows.filter((r) => {
      // Search match
      const searchMatch =
        !q ||
        columns.some((c) => {
          const v = r[c.key];
          return v !== undefined && String(v).toLowerCase().includes(q);
        });
      if (!searchMatch) return false;

      // Filters match (for select columns only)
      if (!hasFilters) return true;
      for (const c of selectColumns) {
        const f = filters[c.key];
        if (f && f !== "__ALL__") {
          if (String(r[c.key] ?? "") !== f) return false;
        }
      }
      return true;
    });
  }, [rows, query, columns, filters, selectColumns]);

  function startAdd() {
    setForm({});
    setEditingIndex(null);
    setOpen(true);
  }

  function startEdit(idx: number) {
    setForm(rows[idx]);
    setEditingIndex(idx);
    setOpen(true);
  }

  async function remove(idx: number) {
    const record = rows[idx];
    if (backend === "supabase" && table) {
      // Change: only require auth if not demo owner
      const check = await ensureSupabaseReady(!demoOwner);
      if (!check.ok || !check.s) return;
      try {
        if (record?.id === undefined || record?.id === null) {
          toast.error("Cannot delete: missing id");
          return;
        }
        setDeleting(String(record.id));
        const { error } = await check.s.from(table).delete().eq("id", record.id);
        if (error) {
          // Detect missing table
          const code = (error as any)?.code ?? (error as any)?.status;
          const m = String((error as any)?.message || "").toLowerCase();
          if (code === "PGRST204" || code === 404 || m.includes("not found")) {
            setMissingTable(true);
          }
          throw error;
        }
        setRows((prev) => prev.filter((_, i) => i !== idx));
        toast.success("Deleted");
        await fetchRows();
      } catch (e: any) {
        console.error(e);
        const msg = parseSupabaseError(e);
        toast.error(`Delete failed: ${msg}`);
      } finally {
        setDeleting(null);
      }
      return;
    }

    // local fallback
    setRows((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Deleted");
  }

  function validate(): string | null {
    for (const c of columns) {
      if (c.required && (form[c.key] === undefined || form[c.key] === "")) {
        return `${c.label} is required`;
      }
    }
    return null;
  }

  async function submit() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (saving) return;

    if (backend === "supabase" && table) {
      // Change: require auth only when owner is not demo@example.com
      const requireAuth = !!ownerField && !demoOwner;
      const check = await ensureSupabaseReady(requireAuth);
      if (!check.ok || !check.s) return;

      try {
        setSaving(true);
        const payload = { ...form };
        if (!payload.id) {
          payload.id = crypto.randomUUID();
        }
        if (ownerField && ownerValue && payload[ownerField] == null) {
          payload[ownerField] = ownerValue;
        }

        if (editingIndex === null) {
          const { error } = await check.s.from(table).insert(payload);
          if (error) {
            // Detect missing table
            const code = (error as any)?.code ?? (error as any)?.status;
            const m = String((error as any)?.message || "").toLowerCase();
            if (code === "PGRST204" || code === 404 || m.includes("not found")) {
              setMissingTable(true);
            }
            throw error;
          }
        } else {
          const current = rows[editingIndex];
          if (current?.id === undefined || current?.id === null) {
            toast.error("Cannot update: missing id");
            return;
          }
          const { error } = await check.s.from(table).update(payload).eq("id", current.id);
          if (error) {
            // Detect missing table
            const code = (error as any)?.code ?? (error as any)?.status;
            const m = String((error as any)?.message || "").toLowerCase();
            if (code === "PGRST204" || code === 404 || m.includes("not found")) {
              setMissingTable(true);
            }
            throw error;
          }
        }
        setOpen(false);
        setEditingIndex(null);
        setForm({});
        toast.success(editingIndex === null ? "Added" : "Updated");
        await fetchRows();
      } catch (e: any) {
        console.error(e);
        const msg = parseSupabaseError(e);
        toast.error(`Save failed: ${msg}`);
      } finally {
        setSaving(false);
      }
      return;
    }

    // local fallback
    if (editingIndex === null) {
      setRows((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev]);
      toast.success("Added");
    } else {
      setRows((prev) => prev.map((r, i) => (i === editingIndex ? { ...r, ...form } : r)));
      toast.success("Updated");
    }
    setOpen(false);
    setEditingIndex(null);
    setForm({});
  }

  function exportCsv() {
    const escapeCsv = (val: any) => {
      const s = String(val ?? "");
      if (/[",\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const header = columns.map((c) => escapeCsv(c.label)).join(",");
    const body = filtered
      .map((row) => columns.map((c) => escapeCsv(row[c.key])).join(","))
      .join("\n");
    const csv = [header, body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="gradient-card">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          ) : null}
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
          <div className="flex gap-2 w/full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-background w-full md:w-[280px]"
              />
            </div>
            {/* Add: Disable + label for refresh */}
            <Button size="sm" variant="outline" onClick={fetchRows} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
            {actions.includes("add") && (
              <Button size="sm" className="neon-glow" onClick={startAdd} disabled={saving}>
                Add
              </Button>
            )}
          </div>
          {selectColumns.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectColumns.map((c) => (
                <Select
                  key={c.key}
                  value={filters[c.key] ?? "__ALL__"}
                  onValueChange={(v) =>
                    setFilters((prev) => ({
                      ...prev,
                      [c.key]: v,
                    }))
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={`Filter ${c.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL__">All {c.label}</SelectItem>
                    {c.options!.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              {Object.values(filters).some((v) => v && v !== "__ALL__") && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilters({})}
                  className="text-muted-foreground"
                  title="Clear all filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Add: Missing table helper with one-click SQL copy */}
        {backend === "supabase" && table && missingTable && (
          <div className="mb-3 rounded-md border border-amber-400/50 bg-amber-50/5 p-3 text-sm">
            <div className="font-medium text-amber-300">Supabase table not found: "{table}"</div>
            <div className="text-amber-200/80 mt-1">
              Run the generated SQL in Supabase → SQL Editor to create this table, then click Refresh.
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(generateCreateTableSql());
                    toast.success("CREATE TABLE SQL copied");
                  } catch {
                    toast.error("Failed to copy SQL");
                  }
                }}
              >
                Copy SQL to create "{table}"
              </Button>
              <Button size="sm" variant="outline" onClick={fetchRows} disabled={refreshing}>
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        )}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.widthClass}>
                    {c.label}
                  </TableHead>
                ))}
                {(actions.includes("edit") || actions.includes("delete")) && (
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, idx) => (
                <TableRow key={r.id ?? idx}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      <span className="text-foreground">
                        {r[c.key] !== undefined && r[c.key] !== null
                          ? String(r[c.key])
                          : "-"}
                      </span>
                    </TableCell>
                  ))}
                  {(actions.includes("edit") || actions.includes("delete")) && (
                    <TableCell className="text-right space-x-2">
                      {actions.includes("edit") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(idx)}
                          disabled={saving || deleting === String(r.id ?? "")}
                        >
                          Edit
                        </Button>
                      )}
                      {actions.includes("delete") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(idx)}
                          disabled={deleting === String(r.id ?? "")}
                        >
                          {deleting === String(r.id ?? "") ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={(v) => (!saving ? setOpen(v) : null)}>
        <DialogContent className="max-w-[95vw] w-screen h-[95vh] md:h-[90vh] p-0 overflow-auto">
          <div className="flex flex-col h-full">
            <div className="px-6 pt-6">
              <DialogHeader>
                <DialogTitle>{editingIndex === null ? "Add" : "Edit"} {title.slice(0, -1)}</DialogTitle>
                <DialogDescription>Fill out the fields below.</DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 pb-2 flex-1 overflow-y-auto">
              <div className="grid gap-3 py-1">
                {columns.map((c) => (
                  <div className="grid gap-1" key={c.key}>
                    <Label>
                      {c.label} {c.required ? <span className="text-rose-400">*</span> : null}
                    </Label>
                    {c.input === "select" && c.options ? (
                      <Select
                        value={String(form[c.key] ?? "")}
                        onValueChange={(v) => setForm((f) => ({ ...f, [c.key]: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${c.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {c.options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : c.input === "textarea" ? (
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={String(form[c.key] ?? "")}
                        onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                        rows={3}
                      />
                    ) : (
                      <Input
                        type={c.input === "number" ? "number" : c.input === "date" ? "date" : "text"}
                        value={String(form[c.key] ?? "")}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            [c.key]: c.input === "number" ? Number(e.target.value) : e.target.value,
                          }))
                        }
                        placeholder={c.label}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6">
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button className="neon-glow" onClick={submit} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}