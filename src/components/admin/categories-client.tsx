"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Tags } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  _count: { products: number };
}

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", active: true });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", image: "", active: true });
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", image: c.image || "", active: c.active });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(editing ? "Category updated" : "Category created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category deleted");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </div>
              </div>
              <Badge variant={c.active ? "default" : "secondary"}>
                {c.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {c.description && <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{c._count.products} products</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" placeholder="e.g. Accessories" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" rows={3} />
            </div>
            <div>
              <Label>Image URL (optional)</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="mt-1.5" placeholder="/uploads/..." />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cat-active">Active</Label>
              <Switch id="cat-active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
