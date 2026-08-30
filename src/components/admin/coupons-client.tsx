"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, TicketPercent, Save, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  active: boolean;
}

const emptyForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrder: "",
  maxDiscount: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  usageLimit: "",
  perUserLimit: "1",
  active: true,
};

export function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.minOrder),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
      startDate: c.startDate.slice(0, 10),
      endDate: c.endDate.slice(0, 10),
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      perUserLimit: String(c.perUserLimit),
      active: c.active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) {
      toast.error("Code and value required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        active: form.active,
      };
      const res = await fetch(
        editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(editing ? "Coupon updated" : "Coupon created");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Coupon deleted");
      router.refresh();
    }
  };

  const toggleActive = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) {
      toast.success(c.active ? "Coupon disabled" : "Coupon enabled");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} coupons · {coupons.filter((c) => c.active).length} active</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> New Coupon
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto ru-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 font-medium">Code</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Value</th>
                <th className="py-3 px-4 font-medium">Min Order</th>
                <th className="py-3 px-4 font-medium">Usage</th>
                <th className="py-3 px-4 font-medium">Valid</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No coupons yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <TicketPercent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-bold">{c.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{c.type}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {c.type === "PERCENTAGE" ? `${c.value}%` : formatCurrency(c.value)}
                      {c.maxDiscount && c.type === "PERCENTAGE" && (
                        <p className="text-xs text-muted-foreground">max {formatCurrency(c.maxDiscount)}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">{formatCurrency(c.minOrder)}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{c.usedCount}</span>
                      <span className="text-muted-foreground">/{c.usageLimit || "∞"}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </td>
                    <td className="py-3 px-4">
                      <Switch checked={c.active} onCheckedChange={() => toggleActive(c)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "New Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1.5 uppercase font-mono" placeholder="RUHVIQUE10" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FLAT">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value {form.type === "PERCENTAGE" ? "(%)" : "(₹)"} <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-1.5" placeholder="10" />
              </div>
              <div>
                <Label>Min Order (₹)</Label>
                <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="mt-1.5" placeholder="999" />
              </div>
              {form.type === "PERCENTAGE" && (
                <div>
                  <Label>Max Discount (₹)</Label>
                  <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="mt-1.5" placeholder="500" />
                </div>
              )}
              <div>
                <Label>Per User Limit</Label>
                <Input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} className="mt-1.5" placeholder="1" />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label>Usage Limit (blank = unlimited)</Label>
                <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="mt-1.5" placeholder="1000" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
