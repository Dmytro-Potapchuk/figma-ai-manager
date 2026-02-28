import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, agents(name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["chat_messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ agentId, title }: { agentId: string; title: string }) => {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user!.id, agent_id: agentId, title })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSaveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      role,
      content,
    }: {
      conversationId: string;
      role: "user" | "assistant" | "intervention";
      content: string;
    }) => {
      const { error } = await supabase
        .from("chat_messages")
        .insert({ conversation_id: conversationId, role, content });
      if (error) throw error;
      // Touch updated_at on conversation
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["chat_messages", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
