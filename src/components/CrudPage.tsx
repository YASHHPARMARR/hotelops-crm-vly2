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
      let query = this.supabase.from(this.table).select('*');
      
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          query = query.eq('owner', email);
        }
      }
      
      // Order by created_at if exists, otherwise by id
      const { data, error } = await query.order('created_at', { ascending: false, nullsFirst: false })
        .catch(() => query.order('id'));
      
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
      // Ensure wide type to allow owner injection without TS error
      const newRow: Record<string, any> = { ...row, id: crypto.randomUUID() };
      
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          newRow.owner = email;
        }
      }
      
      const { data, error } = await this.supabase
        .from(this.table)
        .insert([newRow])
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
      let query = this.supabase.from(this.table).update(patch).eq('id', id);
      
      if (this.ownerScoped) {
        const email = await getSupabaseUserEmail();
        if (email) {
          query = query.eq('owner', email);
        }
      }
      
      const { data, error } = await query.select().single();
      
      if (error) throw error;
      return data;
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
    
    try {
      this.channel = this.supabase
        .channel(`crud:${this.table}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: this.table }, 
          () => callback()
        )
        .subscribe();
      
      return () => {
        if (this.channel) {
          this.supabase?.removeChannel(this.channel);
          this.channel = null;
        }
      };
    } catch (e) {
      console.error(`Supabase subscribe error for ${this.table}:`, e);
      return () => {};
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

  // Determine provider based on conditions
  const getProvider = useCallback((): StorageProvider => {
    const isDemoMode = window.location.search.includes('demo=1');
    const supabaseAvailable = !!getSupabase();
    
    if (table && !isDemoMode && supabaseAvailable) {
      return new SupabaseProvider(table, ownerScoped);
    } else {
      // Fallback to localStorage
      const key = storageKey || `crud_${title.toLowerCase().replace(/\s+/g, '_')}`;
      return new LocalProvider(key);
    }
  }, [table, ownerScoped, storageKey, title]);

  const [provider] = useState(() => getProvider());

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await provider.list();
      setItems(data);
    } catch (e: any) {
      const errorMsg = normalizeSupabaseError(e);
      setError(errorMsg);
      
      if (errorMsg.includes('Permission denied') || errorMsg.includes('RLS')) {
        toast.error("Database permission error", {
          description: "Please run RLS SQL from Admin Settings and/or sign in if required."
        });
      } else {
        toast.error(`Failed to load ${title.toLowerCase()}: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [provider, title]);

  // Subscribe to real-time updates
  useEffect(() => {
    loadData();
    const unsubscribe = provider.subscribe(() => {
      loadData();
    });
    
    return unsubscribe;
  }, [loadData, provider]);

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
      if (errorMsg.includes('Permission denied') || errorMsg.includes('RLS')) {
        toast.error("Database permission error", {
          description: "Please run RLS SQL from Admin Settings and/or sign in if required."
        });
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
      if (errorMsg.includes('Permission denied') || errorMsg.includes('RLS')) {
        toast.error("Database permission error", {
          description: "Please run RLS SQL from Admin Settings and/or sign in if required."
        });
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

    if (inputType === "select" && column.options) {
      // Normalize options to string values
      const options: string[] = (column.options as Array<string | { label: string; value: string }>).map(
        (opt: any) => (typeof opt === "string" ? opt : opt.value)
      );
      const labels: Record<string, string> = (column.options as Array<string | { label: string; value: string }>).reduce(
        (acc: Record<string, string>, opt: any) => {
          if (typeof opt === "string") acc[opt] = opt;
          else acc[opt.value] = opt.label;
          return acc;
        },
        {}
      );

      return (
        <Select
          value={String(value)}
          onValueChange={(newValue) => setForm((prev: any) => ({ ...prev, [column.key]: newValue }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${column.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt: string) => (
              <SelectItem key={opt} value={opt}>
                {labels[opt] ?? opt}
              </SelectItem>
            ))}
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
          {table && getSupabase() && !window.location.search.includes('demo=1') && (
            <Badge variant="outline" className="text-xs">
              Realtime
            </Badge>
          )}
          {(!table || !getSupabase() || window.location.search.includes('demo=1')) && (
            <Badge variant="secondary" className="text-xs">
              Demo Mode
            </Badge>
          )}
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