"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/account";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Fill all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Auto sign-in
        const r = await signIn("customer-credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (r?.ok) {
          toast.success("Account created!");
          router.push(callbackUrl);
          router.refresh();
        } else {
          toast.success("Account created. Please sign in.");
          router.push("/signin");
        }
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <div className="ru-logo-shine ru-logo-ring ru-logo-glow-dark rounded-md overflow-hidden">
            <img
              src="/ruhvique-logo.jpeg"
              alt="RUHVIQUE"
              className="h-11 w-11 rounded-md object-cover"
            />
          </div>
          <span className="text-2xl font-black tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">RUHVIQUE</span>
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight leading-tight">
            Join the Ruhvique circle.
          </h1>
          <p className="mt-4 text-primary-foreground/70 max-w-md">
            Create an account to track orders, save addresses, and unlock a faster checkout.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} Ruhvique. Crafted for those who wear their attitude.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black tracking-tight">Create Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Join Ruhvique in seconds</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="pl-10"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10"
                  placeholder="you@email.com"
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
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className="pl-10"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? "Creating..." : <>Create Account <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-muted-foreground">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
