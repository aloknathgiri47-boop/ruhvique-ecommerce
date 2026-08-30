"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Upload, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaText: string | null;
  ctaLink: string | null;
  displayOrder: number;
  active: boolean;
}

export function BannersClient({ banners, sampleImage }: { banners: Banner[]; sampleImage: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", ctaText: "", ctaLink: "", active: true });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.urls?.[0]) {
        setForm((f) => ({ ...f, image: data.urls[0] }));
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const openNew = () => {
    setForm({ title: "", subtitle: "", image: "", ctaText: "", ctaLink: "", active: true });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.subtitle.trim()) {
      toast.error("Subtitle is required");
      return;
    }
    if (!form.image) {
      toast.error("Banner image is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, displayOrder: banners.length }),
      });
      if (res.ok) {
        toast.success("Banner created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to create");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, active: !b.active }),
    });
    if (res.ok) {
      toast.success(b.active ? "Banner disabled" : "Banner enabled");
      router.refresh();
    } else {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Banner deleted");
      router.refresh();
    }
  };

  const reorder = async (b: Banner, direction: -1 | 1) => {
    const sorted = [...banners].sort((a, c) => a.displayOrder - c.displayOrder);
    const idx = sorted.findIndex((x) => x.id === b.id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const other = sorted[newIdx];
    // Swap displayOrder
    await Promise.all([
      fetch(`/api/admin/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: other.displayOrder }),
      }),
      fetch(`/api/admin/banners/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: b.displayOrder }),
      }),
    ]);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Banners</h1>
          <p className="text-sm text-muted-foreground">{banners.length} banners · {banners.filter((b) => b.active).length} active</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b, idx) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="aspect-[16/7] relative bg-muted">
              { }
              <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={b.active ? "default" : "secondary"}>{b.active ? "Active" : "Disabled"}</Badge>
                <Badge variant="outline" className="bg-background/80">#{b.displayOrder + 1}</Badge>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => reorder(b, -1)} disabled={idx === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => reorder(b, 1)} disabled={idx === banners.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold line-clamp-1">{b.title}</h3>
              {b.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{b.subtitle}</p>}
              {b.ctaText && (
                <p className="text-xs mt-1 text-muted-foreground">
                  CTA: <span className="font-medium text-foreground">{b.ctaText}</span> → {b.ctaLink || "/"}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={b.active} onCheckedChange={() => toggleActive(b)} />
                  <Label className="text-xs">{b.active ? "Enabled" : "Disabled"}</Label>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New banner modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/uploads/... or URL"
                />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? "..." : "Upload"}
                </Button>
                <Button variant="ghost" onClick={() => setForm({ ...form, image: sampleImage })}>Sample</Button>
              </div>
              {form.image && (
                <div className="mt-2 aspect-[16/7] relative rounded-md overflow-hidden bg-muted">
                  { }
                  <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  className="mt-1.5" 
                  placeholder="Winter Drop 2026"
                  required
                />
                {!form.title.trim() && (
                  <p className="mt-1 text-xs text-destructive">Title is required</p>
                )}
              </div>
              <div>
                <Label>Subtitle <span className="text-destructive">*</span></Label>
                <Input 
                  value={form.subtitle} 
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })} 
                  className="mt-1.5" 
                  placeholder="Premium heavyweight essentials"
                  required
                />
                {!form.subtitle.trim() && (
                  <p className="mt-1 text-xs text-destructive">Subtitle is required</p>
                )}
              </div>
              <div>
                <Label>CTA Text</Label>
                <Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="mt-1.5" placeholder="Shop Now" />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="mt-1.5" placeholder="/hoodies" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave} 
                disabled={saving || !form.title.trim() || !form.subtitle.trim() || !form.image} 
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Create Banner"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
