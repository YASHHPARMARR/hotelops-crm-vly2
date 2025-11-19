import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getSupabase, getSupabaseUserEmail, normalizeSupabaseError } from "@/lib/supabaseClient";
import { Textarea } from "@/components/ui/textarea";

// Storage provider interface
interface StorageProvider {
  list(): Promise<Record<string, any>[]>;
  create(row: Record<string, any>): Promise<Record<string, any>>;
  update(id: string, patch: Record<string, any>): Promise<Record<string, any>>;
  remove(id: string): Promise<void>;
  subscribe(callback: () => void): () => void;
}

// Local storage provider (existing behavior)
class LocalProvider implements StorageProvider {
  // Replace parameter property with explicit field to satisfy TS "erasableSyntaxOnly"
  private key: string;
  constructor(key: string) {
    this.key = key;
  }

  async list(): Promise<Record<string, any>[]> {
    try {
      const stored = localStorage.getItem(this.key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async create(row: Record<string, any>): Promise<Record<string, any>> {
    const items = await this.list();
    const newItem = { ...row, id: crypto.randomUUID() };
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }

  async update(id: string, patch: Record<string, any>): Promise<Record<string, any>> {
    const items = await this.list();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error("Item not found");
    
    const updated = { ...items[index], ...patch };
    items[index] = updated;
    localStorage.setItem(this.key, JSON.stringify(items));
    return updated;
  }

  async remove(id: string): Promise<void> {
    const items = await this.list();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }

  subscribe(callback: () => void): () => void {
    // Local storage doesn't have real-time updates
    return () => {};
  }
}

// Supabase provider (new)
class SupabaseProvider implements StorageProvider {
  private supabase = getSupabase();
  private channel: any = null;
  // Replace parameter properties with explicit fields to satisfy TS "erasableSyntaxOnly"
  private table: string;
  private ownerScoped: boolean;

  constructor(table: string, ownerScoped: boolean = false) {
    this.table = table;
    this.ownerScoped = ownerScoped;
  }

  async list(): Promise<Record<string, any>[]> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    
    try {
      let query = this.supabase.from(this.table).select("*");
      
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          query = query.eq("owner", email);
        }
      }
      
      // Simplify ordering to avoid relying on columns that may not exist (like created_at)
      const { data, error } = await query.order("id", { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e: any) {
      console.error(`Supabase list error for ${this.table}:`, e);
      throw e;
    }
  }

  async create(row: Record<string, any>): Promise<Record<string, any>> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    
    try {
      // Do NOT force client-side id for Supabase; let DB defaults handle it
      const newRow: Record<string, any> = { ...row };
      
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          newRow.owner = email;
        }
      }

      // Ensure an id is present to satisfy tables without a DB default
      if (!("id" in newRow) || newRow.id === undefined || newRow.id === null || newRow.id === "") {
        newRow.id = crypto.randomUUID();
      }

      // Drop only empty-string fields; do not strip columns reported missing
      const cleaned: Record<string, any> = Object.fromEntries(
        Object.entries(newRow).filter(([_, v]) => v !== "" && v !== undefined)
      );

      const { data, error } = await this.supabase!
        .from(this.table)
        .insert([cleaned])
        .select()
        .single();

      if (error) throw error;
      return data as Record<string, any>;
    } catch (e: any) {
      console.error(`Supabase create error for ${this.table}:`, e);
      throw e;
    }
  }

  async update(id: string, patch: Record<string, any>): Promise<Record<string, any>> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    
    try {
      // Only drop undefined values, keep empty strings as they are valid data
      const cleaned: Record<string, any> = Object.fromEntries(
        Object.entries(patch).filter(([_, v]) => v !== undefined)
      );

      let query = this.supabase!.from(this.table).update(cleaned).eq('id', id);
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          query = query.eq('owner', email);
        }
      }

      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Record<string, any>;
    } catch (e: any) {
      console.error(`Supabase update error for ${this.table}:`, e);
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    if (!this.supabase) throw new Error("Supabase not initialized");
    
    try {
      let query = this.supabase.from(this.table).delete().eq('id', id);
      
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          query = query.eq('owner', email);
        }
      }
      
      const { error } = await query;
      
      if (error) throw error;
    } catch (e: any) {
      console.error(`Supabase remove error for ${this.table}:`, e);
      throw e;
    }
  }

  subscribe(callback: () => void): () => void {
    if (!this.supabase) return () => {};
    
    // Replace frequent updates and realtime with a simple 30s refresh
    let intervalId: any = null;
    try {
      intervalId = setInterval(() => {
        try {
          callback();
        } catch {
          // ignore callback errors
        }
      }, 30000); // 30 seconds

      // Removed Supabase realtime channel subscription to stop live refreshes

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    } catch (e) {
      console.error(`Supabase subscribe error for ${this.table}:`, e);
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }
}

export interface CrudPageProps {
  title: string;
  description?: string;
  columns: Array<{
    key: string;
    label: string;
    // Support legacy `input` alias to avoid breaking existing pages
    type?: "text" | "number" | "date" | "select" | "email" | "tel" | "textarea";
    input?: "text" | "number" | "date" | "select" | "email" | "tel" | "textarea";
    // Support both string[] and {label,value}[] for options to match older pages
    options?: Array<string | { label: string; value: string }>;
    required?: boolean;
    // Add: dynamic options from Supabase
    dynamicOptions?: {
      table: string;
      valueField: string;
      labelField?: string;
      // Extend filters with "in" to support multiple candidates (e.g., case variations)
      filters?: Array<{ column: string; op: "eq" | "neq" | "gte" | "lte" | "in" | "ilike"; value: any }>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    };
  }>;
  table?: string; // Supabase table name
  ownerScoped?: boolean; // Whether to scope by owner email
  storageKey?: string; // Fallback localStorage key (for backward compatibility)
  // Accept legacy props so existing pages compile without edits
  seed?: Array<Record<string, any>>;
  backend?: string;
}

export function CrudPage({ 
  title, 
  description, 
  columns, 
  table,
  ownerScoped = false,
  storageKey 
}: CrudPageProps) {
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dynamicOptionsMap, setDynamicOptionsMap] = useState<Record<string, Array<{ value: string; label: string }>>>({});

  // Determine provider based on conditions
  const getProvider = useCallback((): StorageProvider => {
    const supabaseAvailable = !!getSupabase();
    
    // Always prefer Supabase if available and table is defined (regardless of demo mode)
    if (supabaseAvailable && table) {
      return new SupabaseProvider(table, ownerScoped);
    }
    
    // Only fall back to localStorage if Supabase is not available
    const key = storageKey || `crud_${title.toLowerCase().replace(/\s+/g, '_')}`;
    return new LocalProvider(key);
  }, [table, ownerScoped, storageKey, title]);

  // Helper to create a local provider for seamless fallback
  const makeLocalProvider = useCallback((): StorageProvider => {
    const key = storageKey || `crud_${title.toLowerCase().replace(/\s+/g, '_')}`;
    return new LocalProvider(key);
  }, [storageKey, title]);

  // Replace constant provider with reactive one to switch to Supabase without reload
  const [provider, setProvider] = useState<StorageProvider>(() => getProvider());

  // Recompute provider when Supabase keys are added/cleared (no page reload needed)
  useEffect(() => {
    const onReady = () => setProvider(getProvider());
    const onCleared = () => setProvider(getProvider());
    window.addEventListener('supabase:ready', onReady);
    window.addEventListener('supabase:cleared', onCleared);
    return () => {
      window.removeEventListener('supabase:ready', onReady);
      window.removeEventListener('supabase:cleared', onCleared);
    };
  }, [getProvider]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await provider.list();
      setItems(data);
    } catch (e: any) {
      const errorMsg = normalizeSupabaseError(e);
      
      if (errorMsg.includes('Permission denied') || errorMsg.includes('RLS') || errorMsg.includes('not initialized')) {
        // Seamless fallback to local provider and reload
        const local = makeLocalProvider();
        setProvider(local);
        try {
          const data = await local.list();
          setItems(data);
          setError(null);
        } catch {
          setError("Failed to load data");
          toast.error(`Failed to load ${title.toLowerCase()}`);
        }
      } else {
        setError(errorMsg);
        toast.error(`Failed to load ${title.toLowerCase()}: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [provider, title, makeLocalProvider]);

  // Subscribe to real-time updates
  useEffect(() => {
    loadData();
    const unsubscribe = provider.subscribe(() => {
      loadData();
    });
    
    return unsubscribe;
  }, [loadData, provider]);

  // Duplicate dynamicOptionsMap state removed (already declared above)

  // Add: loader for dynamic options from Supabase
  const loadDynamicOptions = useCallback(async (columnKey: string) => {
    const col = columns.find(c => c.key === columnKey);
    if (!col?.dynamicOptions) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const cfg = col.dynamicOptions;
    try {
      let q = supabase.from(cfg.table).select("*");
      if (cfg.filters && cfg.filters.length > 0) {
        for (const f of cfg.filters) {
          if (f.op === "eq") q = q.eq(f.column, f.value);
          if (f.op === "neq") q = q.neq(f.column, f.value);
          if (f.op === "gte") q = q.gte(f.column, f.value);
          if (f.op === "lte") q = q.lte(f.column, f.value);
          if (f.op === "in") {
            const arr = Array.isArray(f.value) ? f.value : [f.value];
            q = q.in(f.column, arr);
          }
          // New: case-insensitive match for strings
          if (f.op === "ilike") {
            q = q.ilike(f.column, f.value);
          }
        }
      }
      if (cfg.orderBy) {
        q = q.order(cfg.orderBy.column, { ascending: cfg.orderBy.ascending ?? true });
      }
      if (cfg.limit) q = q.limit(cfg.limit);

      const { data, error } = await q;
      if (error) throw error;

      const opts: Array<{ value: string; label: string }> = (Array.isArray(data) ? data : []).map((row: any) => {
        const value = String(row[cfg.valueField] ?? "");
        const label = String((cfg.labelField ? row[cfg.labelField] : row[cfg.valueField]) ?? value);
        return { value, label };
      }).filter(opt => opt.value !== "");

      setDynamicOptionsMap(prev => ({ ...prev, [columnKey]: opts }));
    } catch {
      // fail silently
    }
  }, [columns]);

  // Load dynamic options on mount and when provider changes
  useEffect(() => {
    for (const col of columns) {
      if (col.dynamicOptions) {
        loadDynamicOptions(col.key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // Initialize form with default values
  useEffect(() => {
    const defaultForm: Record<string, any> = {};
    columns.forEach(col => {
      const inputType = col.type || col.input || "text";
      if (inputType === "number") {
        defaultForm[col.key] = 0;
      } else if (inputType === "date") {
        defaultForm[col.key] = new Date().toISOString().slice(0, 10);
      } else {
        defaultForm[col.key] = "";
      }
    });
    setForm(defaultForm);
  }, [columns]);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const missingFields = columns
        .filter(col => col.required && !form[col.key])
        .map(col => col.label);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
        return;
      }

      if (editingId) {
        await provider.update(editingId, form);
        toast.success(`${title} updated successfully`);
        setEditingId(null);
      } else {
        await provider.create(form);
        toast.success(`${title} created successfully`);
      }
      
      // Reset form
      const defaultForm: Record<string, any> = {};
      columns.forEach(col => {
        const inputType = col.type || col.input || "text";
        if (inputType === "number") {
          defaultForm[col.key] = 0;
        } else if (inputType === "date") {
          defaultForm[col.key] = new Date().toISOString().slice(0, 10);
        } else {
          defaultForm[col.key] = "";
        }
      });
      setForm(defaultForm);
      
      await loadData();
    } catch (e: any) {
      const errorMsg = normalizeSupabaseError(e);
      
      if (errorMsg.includes('Permission denied') || errorMsg.includes('RLS') || errorMsg.includes('not initialized')) {
        // Seamless fallback and retry on local
        const local = makeLocalProvider();
        setProvider(local);
        try {
          if (editingId) {
            await local.update(editingId, form);
            toast.success(`${title} updated successfully`);
            setEditingId(null);
          } else {
            await local.create(form);
            toast.success(`${title} created successfully`);
          }
          await loadData();
        } catch {
          toast.error(`Failed to save ${title.toLowerCase()}`);
        }
      } else {
        toast.error(`Failed to save: ${errorMsg}`);
      }
    }
  };

  const handleEdit = (item: Record<string, any>) => {
    setForm({ ...item });
    setEditingId(item.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await provider.remove(id);
      toast.success(`${title} deleted successfully`);
      await loadData();
    } catch (e: any) {
      const errorMsg = normalizeSupabaseError(e);
      
      if (errorMsg.includes('Permission denied') || errorMsg.includes('RLS') || errorMsg.includes('not initialized')) {
        const local = makeLocalProvider();
        setProvider(local);
        try {
          await local.remove(id);
          toast.success(`${title} deleted successfully`);
          await loadData();
        } catch {
          toast.error(`Failed to delete ${title.toLowerCase()}`);
        }
      } else {
        toast.error(`Failed to delete: ${errorMsg}`);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    const defaultForm: Record<string, any> = {};
    columns.forEach(col => {
      const inputType = col.type || col.input || "text";
      if (inputType === "number") {
        defaultForm[col.key] = 0;
      } else if (inputType === "date") {
        defaultForm[col.key] = new Date().toISOString().slice(0, 10);
      } else {
        defaultForm[col.key] = "";
      }
    });
    setForm(defaultForm);
  };

  const renderFormField = (column: any) => {
    const inputType = column.type || column.input || "text";
    const value = form[column.key] ?? (inputType === "number" ? 0 : "");

    if (inputType === "select" && (column.options || column.dynamicOptions)) {
      // Normalize static options if provided
      const hasDynamic = !!column.dynamicOptions && !!getSupabase();
      const dyn = hasDynamic ? (dynamicOptionsMap[column.key] || []) : [];
      const staticOptions: string[] = (column.options as Array<string | { label: string; value: string }> | undefined)?.map(
        (opt: any) => (typeof opt === "string" ? opt : opt.value)
      ) || [];
      const staticLabels: Record<string, string> = (column.options as Array<string | { label: string; value: string }> | undefined)?.reduce(
        (acc: Record<string, string>, opt: any) => {
          if (typeof opt === "string") acc[opt] = opt;
          else acc[opt.value] = opt.label;
          return acc;
        },
        {}
      ) || {};

      // Combine dynamic and static (dynamic first)
      const combined: Array<{ value: string; label: string }> = [
        ...dyn,
        ...staticOptions
          .filter((v: string) => !dyn.find(d => d.value === v))
          .map((v: string) => ({ value: v, label: staticLabels[v] ?? v })),
      ];

      return (
        <Select
          value={String(value)}
          onValueChange={(newValue) => setForm((prev: any) => ({ ...prev, [column.key]: newValue }))}
          // when opened, refresh dynamic options
          onOpenChange={(open: boolean) => {
            if (open && hasDynamic) loadDynamicOptions(column.key);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${column.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {combined.length === 0 ? (
              <SelectItem value="__none__" disabled>
                {hasDynamic ? "No options (check Supabase connection/data)" : "No options"}
              </SelectItem>
            ) : (
              combined.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      );
    }

    if (inputType === "textarea") {
      return (
        <Textarea
          value={String(value)}
          onChange={(e) =>
            setForm((prev: any) => ({ ...prev, [column.key]: e.target.value }))
          }
          placeholder={`Enter ${column.label.toLowerCase()}`}
          required={column.required}
        />
      );
    }

    return (
      <Input
        type={inputType}
        value={String(value)}
        onChange={(e) => {
          const newValue = inputType === "number" ? Number(e.target.value) : e.target.value;
          setForm((prev: any) => ({ ...prev, [column.key]: newValue }));
        }}
        placeholder={`Enter ${column.label.toLowerCase()}`}
        required={column.required}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const supabaseAvailable = !!getSupabase();
            
            if (table && supabaseAvailable && provider instanceof SupabaseProvider) {
              return (
                <Badge variant="outline" className="text-xs">
                  Live Data
                </Badge>
              );
            } else {
              return (
                <Badge variant="secondary" className="text-xs">
                  Local Storage
                </Badge>
              );
            }
          })()}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>{editingId ? `Edit ${title}` : `Add New ${title}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div key={column.key} className="space-y-2">
                <Label htmlFor={column.key}>
                  {column.label}
                  {column.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderFormField(column)}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="neon-glow">
              {editingId ? "Update" : "Add"} {title}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>{title} List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {title.toLowerCase()} found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {columns.map((column) => (
                      <th key={column.key} className="text-left p-3 font-medium">
                        {column.label}
                      </th>
                    ))}
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      {columns.map((column) => (
                        <td key={column.key} className="p-3">
                          {String(item[column.key] || "-")}
                        </td>
                      ))}
                      <td className="p-3 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}