"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send message");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Get in touch</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Questions about an order, a product, or a collaboration? We typically respond within 24 hours.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "hello@ruhvique.com", href: "mailto:hello@ruhvique.com" },
            { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
            { icon: MapPin, label: "Studio", value: "Indiranagar, Bengaluru, India 560038" },
            { icon: Clock, label: "Hours", value: "Mon–Sat, 10AM – 7PM IST" },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground flex-shrink-0">
                  <c.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="mt-0.5 text-sm font-medium hover:underline">{c.value}</a>
                  ) : (
                    <p className="mt-0.5 text-sm font-medium">{c.value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 rounded-lg border border-border p-5 sm:p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Your name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@email.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="How can we help?"
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={6}
              placeholder="Tell us more..."
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto h-12 px-8">
            {submitting ? (
              <>Sending...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Send Message</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
