"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Enter email and password");
      return;
    }
    setLoading(true);
    const res = await signIn("admin-credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid admin credentials");
    } else {
      toast.success("Welcome back, admin");
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md bg-background rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="group inline-flex flex-col items-center gap-3">
            <div className="ru-logo-shine ru-logo-ring ru-logo-shadow ru-logo-hover ru-logo-enter rounded-lg overflow-hidden">
              <img
                src="/ruhvique-logo.jpeg"
                alt="RUHVIQUE"
                className="rounded-lg object-cover"
                style={{ height: "96px", width: "96px" }}
              />
            </div>
            <span className="text-3xl font-black tracking-[0.2em] group-hover:tracking-[0.28em] transition-all">
              RUHVIQUE
            </span>
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            <Shield className="h-3 w-3" /> Admin Panel
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">Secure Sign In</h1>
        <p className="text-sm text-muted-foreground mb-6">Authorized personnel only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Admin Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10"
                placeholder="admin@ruhvique.com"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Signing in..." : <>Sign In <ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
        </form>

        <div className="mt-6 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo admin credentials:</p>
          <p className="mt-1">Email: <span className="font-mono">admin@ruhvique.com</span></p>
          <p>Password: <span className="font-mono">admin123</span></p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
