import { useEffect, useMemo, useState } from "react";
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
  const { title, storageKey, columns, seed, actions = ["add", "edit", "delete"], description } = props;
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Record<string, any>[]>(() => {
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

  useEffect(() => {
    saveLocal(storageKey, rows);
  }, [storageKey, rows]);

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

  function remove(idx: number) {
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

  function submit() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (editingIndex === null) {
      setRows((prev) => [{ id: crypto.randomUUID(), ...form }, ...prev]);
      toast.success("Added");
    } else {
      setRows((prev) =>
        prev.map((r, i) => (i === editingIndex ? { ...r, ...form } : r)),
      );
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
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-background w-full md:w-[280px]"
              />
            </div>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
            {actions.includes("add") && (
              <Button size="sm" className="neon-glow" onClick={startAdd}>
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
                        >
                          Edit
                        </Button>
                      )}
                      {actions.includes("delete") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(idx)}
                        >
                          Delete
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex === null ? "Add" : "Edit"} {title.slice(0, -1)}</DialogTitle>
            <DialogDescription>Fill out the fields below.</DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="neon-glow" onClick={submit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}