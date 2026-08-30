"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Trash2, Reply, MailOpen, Send } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  UNREAD: "bg-blue-100 text-blue-800",
  READ: "bg-amber-100 text-amber-800",
  REPLIED: "bg-emerald-100 text-emerald-800",
};

export function ContactMessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");

  const openMessage = async (m: Message) => {
    setSelected(m);
    setReply(m.adminReply || "");
    if (m.status === "UNREAD") {
      await fetch(`/api/admin/contact/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "READ" }),
      });
      router.refresh();
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    const res = await fetch(`/api/admin/contact/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminReply: reply }),
    });
    if (res.ok) {
      toast.success("Reply saved");
      setSelected(null);
      router.refresh();
    } else {
      toast.error("Failed to save reply");
    }
  };

  const handleDelete = async (m: Message) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    const res = await fetch(`/api/admin/contact/${m.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Message deleted");
      if (selected?.id === m.id) setSelected(null);
      router.refresh();
    }
  };

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} messages · {unreadCount} unread
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Mail className="mx-auto h-10 w-10" />
              <p className="mt-3">No messages yet.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 flex items-start gap-3 hover:bg-muted/30 cursor-pointer ${
                  m.status === "UNREAD" ? "bg-blue-50/30" : ""
                }`}
                onClick={() => openMessage(m)}
              >
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{m.name}</p>
                    {m.status === "UNREAD" && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[m.status]}`}>
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{m.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(m.createdAt)} · {m.email}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m);
                  }}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Message detail / reply dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                {selected.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{selected.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="font-medium">{formatDateTime(selected.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
              <div>
                <Label htmlFor="reply">Reply / Internal note</Label>
                <Textarea
                  id="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="mt-1.5"
                  placeholder="Type your reply..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={sendReply} disabled={!reply.trim()} className="flex-1">
                  <Send className="h-4 w-4 mr-2" /> Save Reply
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
