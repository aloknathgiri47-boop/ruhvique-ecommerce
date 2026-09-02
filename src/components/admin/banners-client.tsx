"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
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

// Recommended banner dimensions (matches storefront hero aspect ratios)
// Mobile: 16:9  →  1600 × 900
// Tablet: 21:9  →  1600 × 686
// Desktop: 16:5 →  1600 × 500
// Best practice: upload 1600×500 (desktop) — it auto-crops on smaller screens
const RECOMMENDED_WIDTH = 1600;
const RECOMMENDED_HEIGHT = 500;
const RECOMMENDED_SIZE = `${RECOMMENDED_WIDTH} × ${RECOMMENDED_HEIGHT} px`;
const RECOMMENDED_ASPECT = "16:5";
const MAX_FILE_SIZE = "5 MB";
const SUPPORTED_FORMATS = "JPG, PNG, WebP";

export function BannersClient({ banners, sampleImage }: { banners: Banner[]; sampleImage: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", ctaText: "", ctaLink: "", active: true });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // File size check (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_FILE_SIZE}. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress for UX (the actual fetch doesn't support progress events easily)
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 90));
    }, 120);

    const fd = new FormData();
    fd.append("files", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.urls?.[0]) {
        setUploadProgress(100);
        setForm((f) => ({ ...f, image: data.urls[0] }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Network error during upload");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      // Reset file input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const openNew = () => {
    setForm({ title: "", subtitle: "", image: "", ctaText: "", ctaLink: "", active: true });
    setOpen(true);
  };

  const handleSave = async () => {
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

      {/* Recommended dimensions info banner */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary flex-shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Recommended Banner Dimensions</p>
            <p className="mt-1 text-xs text-muted-foreground">
              For best results on all devices, upload banners at <span className="font-bold text-foreground">{RECOMMENDED_SIZE}</span> (aspect ratio <span className="font-bold text-foreground">{RECOMMENDED_ASPECT}</span>).
              Max file size <span className="font-bold text-foreground">{MAX_FILE_SIZE}</span>. Supported formats: <span className="font-bold text-foreground">{SUPPORTED_FORMATS}</span>.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <Badge variant="outline" className="font-mono">Desktop: 1600×500 (16:5)</Badge>
              <Badge variant="outline" className="font-mono">Tablet: 1600×686 (21:9)</Badge>
              <Badge variant="outline" className="font-mono">Mobile: 1600×900 (16:9)</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {banners.map((b, idx) => (
          <Card key={b.id} className="overflow-hidden p-0 gap-0 flex flex-col">
            <div className="aspect-[16/7] relative bg-muted flex-shrink-0">
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
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                {b.title?.trim() ? (
                  <h3 className="font-bold line-clamp-1">{b.title}</h3>
                ) : (
                  <h3 className="font-bold line-clamp-1 text-muted-foreground italic">No title</h3>
                )}
                <div className="min-h-[18px]">
                  {b.subtitle?.trim() && <p className="text-xs text-muted-foreground line-clamp-1">{b.subtitle}</p>}
                </div>
                <div className="min-h-[20px] mt-1">
                  {b.ctaText && (
                    <p className="text-xs text-muted-foreground">
                      CTA: <span className="font-medium text-foreground">{b.ctaText}</span> → {b.ctaLink || "/"}
                    </p>
                  )}
                </div>
              </div>
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
            {/* Image upload section with dropzone + dimensions info */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Banner Image</Label>
                <span className="text-[11px] text-muted-foreground">
                  Recommended: <span className="font-bold text-foreground">{RECOMMENDED_SIZE}</span>
                </span>
              </div>

              {/* Dropzone / Upload area */}
              {!form.image && !uploading && (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
                  }}
                  className={`mt-1.5 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-foreground/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">Click to upload or drag & drop</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {SUPPORTED_FORMATS} up to {MAX_FILE_SIZE}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[10px]">
                    <Badge variant="outline" className="font-mono">1600 × 500 px</Badge>
                    <Badge variant="outline" className="font-mono">16:5 ratio</Badge>
                  </div>
                </div>
              )}

              {/* Uploading progress indicator */}
              {uploading && (
                <div className="mt-1.5 rounded-lg border-2 border-primary/30 bg-primary/5 p-8 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                  <p className="mt-3 text-sm font-bold">Uploading image...</p>
                  <p className="mt-1 text-xs text-muted-foreground">Please wait, do not close this window</p>
                  {/* Progress bar */}
                  <div className="mt-4 mx-auto max-w-xs">
                    <div className="h-2 w-full rounded-full bg-primary/20 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-bold text-primary">{uploadProgress}%</p>
                  </div>
                </div>
              )}

              {/* Preview after upload */}
              {form.image && !uploading && (
                <div className="mt-1.5 relative rounded-lg overflow-hidden border-2 border-emerald-500/30 bg-muted group">
                  <div className="aspect-[16/5] relative">
                    { }
                    <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-2.5 py-1 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                  </div>
                  <button
                    onClick={() => setForm({ ...form, image: "" })}
                    className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2 py-1 text-[10px] font-mono">
                    {RECOMMENDED_SIZE}
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />

              {/* Manual URL input + buttons (only when no image yet) */}
              {!form.image && !uploading && (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="...or paste image URL here"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setForm({ ...form, image: sampleImage })}
                  >Use Sample</Button>
                </div>
              )}

              {/* Re-upload option when image exists */}
              {form.image && !uploading && (
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Different Image
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Or paste a new URL:
                  </span>
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Title, Subtitle, CTA fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1.5"
                  placeholder="Winter Drop 2026"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Shown as main heading on banner</p>
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="mt-1.5"
                  placeholder="Premium heavyweight essentials"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Shown below title in smaller text</p>
              </div>
              <div>
                <Label>CTA Text</Label>
                <Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="mt-1.5" placeholder="Shop Now" />
                <p className="mt-1 text-[11px] text-muted-foreground">Button text (e.g. Shop Now, Explore)</p>
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="mt-1.5" placeholder="/hoodies" />
                <p className="mt-1 text-[11px] text-muted-foreground">Where button should link to (e.g. /hoodies)</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Create Banner</>
                )}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
