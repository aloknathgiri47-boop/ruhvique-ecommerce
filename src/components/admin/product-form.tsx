"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Plus, Upload, X, Star, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  id?: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
  sku?: string | null;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  discountPrice: number | null;
  tax: number;
  categoryId: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  trending: boolean;
  active: boolean;
  images: { id: string; url: string; position: number; isPrimary: boolean }[];
  variants: Variant[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "FREE"];
const COLOR_PRESETS = [
  { name: "Black", hex: "#0a0a0a" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Navy", hex: "#1e293b" },
  { name: "Olive", hex: "#3d4a2a" },
  { name: "Cream", hex: "#f5e6d3" },
  { name: "Maroon", hex: "#5c1f1f" },
  { name: "Khaki", hex: "#a98467" },
];

export function ProductForm({
  product,
  categories,
}: {
  product: Product | null;
  categories: Category[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    discountPrice: product?.discountPrice?.toString() || "",
    tax: product?.tax?.toString() || "5",
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    newArrival: product?.newArrival ?? true,
    trending: product?.trending ?? false,
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) || []);
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.length
      ? product.variants
      : SIZES.slice(1, 5).flatMap((size) =>
          COLOR_PRESETS.slice(0, 4).map((c) => ({
            size,
            color: c.name,
            colorHex: c.hex,
            stock: 10,
          }))
        )
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.urls?.length) {
        setImages((prev) => [...prev, ...data.urls]);
        toast.success(`${data.urls.length} image(s) uploaded`);
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Set image as primary (move to index 0)
  const setPrimaryImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [img] = next.splice(index, 1);
      next.unshift(img);
      return next;
    });
    toast.success("Set as primary image");
  };

  // Move image left
  const moveImageLeft = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  // Move image right
  const moveImageRight = (index: number) => {
    setImages((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addVariant = () => {
    setVariants((v) => [...v, { size: "M", color: "Black", colorHex: "#0a0a0a", stock: 0 }]);
  };
  const updateVariant = (i: number, patch: Partial<Variant>) => {
    setVariants((v) => v.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  };
  const removeVariant = (i: number) => {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  };

  const handleSave = async (asDraft = false) => {
    if (!form.name || !form.sku || !form.categoryId || !form.description || !form.price) {
      toast.error("Fill all required fields");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      sku: form.sku,
      categoryId: form.categoryId,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      tax: Number(form.tax) || 0,
      featured: form.featured,
      bestseller: form.bestseller,
      newArrival: form.newArrival,
      trending: form.trending,
      active: asDraft ? false : form.active,
      variants,
      images,
    };
    try {
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(product ? "Product updated" : "Product created");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {product ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {product ? product.name : "Create a new product"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold">Basic Info</h3>
            <div>
              <Label>Product Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
                placeholder="e.g. Oversized Boxy Tee Noir"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>SKU <span className="text-destructive">*</span></Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  className="mt-1.5 uppercase font-mono"
                  placeholder="RUH-TSH-001"
                />
              </div>
              <div>
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5"
                rows={4}
                placeholder="Product description..."
              />
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-bold">Pricing</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Price (₹) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1.5"
                  placeholder="1299"
                />
              </div>
              <div>
                <Label>Discount Price (₹)</Label>
                <Input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  className="mt-1.5"
                  placeholder="899"
                />
              </div>
              <div>
                <Label>Tax (%)</Label>
                <Input
                  type="number"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                  className="mt-1.5"
                  placeholder="5"
                />
              </div>
            </div>
            {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
              <p className="text-xs text-emerald-600 font-medium">
                Customer saves ₹{(Number(form.price) - Number(form.discountPrice)).toFixed(0)} ({Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)}% OFF)
              </p>
            )}
          </Card>

          {/* Images */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Images</h3>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {uploading ? "Uploading..." : "Upload Images"}
              </Button>
            </div>
            {images.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground">
                <ImagePlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No images yet. Upload at least one image.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-md overflow-hidden border-2 border-border">
                    <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                    {/* Primary badge */}
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" /> Primary
                      </span>
                    )}
                    {/* Image number */}
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {i + 1}
                    </span>
                    {/* Controls overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                      {/* Set primary */}
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(i)}
                          title="Set as primary"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      {/* Move left */}
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImageLeft(i)}
                          title="Move left"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      )}
                      {/* Move right */}
                      {i < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImageRight(i)}
                          title="Move right"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        title="Delete image"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              First image is primary. Hover over images to set primary, reorder, or delete.
            </p>
          </Card>

          {/* Variants */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Variants &amp; Stock ({variants.length})</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Variant
              </Button>
            </div>
            <div className="overflow-x-auto ru-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                    <th className="py-2 pr-2 font-medium">Size</th>
                    <th className="py-2 pr-2 font-medium">Color</th>
                    <th className="py-2 pr-2 font-medium">Hex</th>
                    <th className="py-2 pr-2 font-medium">Stock</th>
                    <th className="py-2 pr-2 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        <Select value={v.size} onValueChange={(val) => updateVariant(i, { size: val })}>
                          <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SIZES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          value={v.color}
                          onChange={(e) => updateVariant(i, { color: e.target.value })}
                          className="h-8 w-28"
                          placeholder="Color name"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1.5">
                          {/* Color picker (visual) */}
                          <input
                            type="color"
                            value={v.colorHex || "#000000"}
                            onChange={(e) => updateVariant(i, { colorHex: e.target.value })}
                            className="h-8 w-9 rounded border cursor-pointer flex-shrink-0"
                            title="Pick color"
                          />
                          {/* Manual hex code input */}
                          <input
                            type="text"
                            value={v.colorHex || ""}
                            onChange={(e) => {
                              let val = e.target.value;
                              // Auto-add # prefix
                              if (val && !val.startsWith("#")) val = "#" + val;
                              // Allow empty or valid hex
                              if (val === "" || /^#[0-9a-fA-F]{0,6}$/.test(val)) {
                                updateVariant(i, { colorHex: val || null });
                              }
                            }}
                            placeholder="#000000"
                            className="h-8 w-24 rounded border px-2 text-xs font-mono"
                            title="Type hex code (e.g. #FF5733)"
                          />
                        </div>
                        {/* Quick preset swatches */}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {COLOR_PRESETS.slice(0, 6).map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => updateVariant(i, { colorHex: c.hex, color: v.color || c.name })}
                              className="h-4 w-4 rounded border border-border hover:scale-110 transition-transform"
                              style={{ background: c.hex }}
                              title={`${c.name} (${c.hex})`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                          className="h-8 w-20"
                          min={0}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <button
                          onClick={() => removeVariant(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: status & flags */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold">Status</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Inactive products are hidden from the storefront.
            </p>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-bold">Display Flags</h3>
            <div className="space-y-3">
              {[
                { key: "featured", label: "Featured", icon: Star },
                { key: "bestseller", label: "Best Seller", icon: Star },
                { key: "newArrival", label: "New Arrival", icon: Star },
                { key: "trending", label: "Trending", icon: Star },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between">
                  <Label htmlFor={f.key} className="cursor-pointer">{f.label}</Label>
                  <Switch
                    id={f.key}
                    checked={(form as any)[f.key]}
                    onCheckedChange={(v) => setForm({ ...form, [f.key]: v })}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Flagged products appear in respective home page carousels.
            </p>
          </Card>

          {/* Actions */}
          <Card className="p-5 space-y-2">
            <Button className="w-full" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {product ? "Update Product" : "Save Product"}
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleSave(true)} disabled={saving}>
              Save as Draft
            </Button>
            <Link href="/admin/products">
              <Button className="w-full" variant="ghost">Cancel</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
