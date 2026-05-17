import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Message } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPanel() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const peerId = params.get("peer") ?? "";
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", user?.id, peerId],
    enabled: !!user && !!peerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user!.id},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${user!.id})`,
        )
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  const send = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        recipient_id: peerId,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id, peerId] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  useEffect(() => {
    if (!user || !peerId) return;

    const channel = supabase
      .channel(`chat-${user.id}-${peerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === user.id && msg.recipient_id === peerId) ||
            (msg.sender_id === peerId && msg.recipient_id === user.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ["messages", user.id, peerId] });
            if (msg.sender_id === peerId) {
              toast.message("New message", { description: msg.content.slice(0, 80) });
            }
            if (msg.recipient_id === user.id && !msg.read_at) {
              supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", msg.id)
                .then();
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, peerId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user || !messages?.length) return;
    const unread = messages.filter((m) => m.recipient_id === user.id && !m.read_at);
    unread.forEach((m) => {
      supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", m.id);
    });
  }, [messages, user]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="p-4">
        <p className="text-sm font-medium text-muted-foreground">Conversation</p>
        <Input
          className="mt-2"
          placeholder="Peer user UUID"
          value={peerId}
          onChange={(e) => setParams({ peer: e.target.value })}
          aria-label="Peer user ID"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Paste an advertiser or influencer user ID to start chatting.
        </p>
      </Card>

      <Card className="flex h-[min(70vh,560px)] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading && <Skeleton className="h-8 w-2/3" />}
          {!peerId && <p className="text-sm text-muted-foreground">Select a peer to view messages.</p>}
          {messages?.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  mine ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form
          className="flex gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim() || !peerId) return;
            send.mutate(text.trim());
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            disabled={!peerId}
            aria-label="Message input"
          />
          <Button type="submit" disabled={!peerId || send.isPending}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
