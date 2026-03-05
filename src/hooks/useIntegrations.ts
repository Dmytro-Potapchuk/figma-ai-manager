import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface IntegrationDef {
  name: string;
  description: string;
  icon: string;
}

export const AVAILABLE_INTEGRATIONS: IntegrationDef[] = [
  { name: "OpenAI", description: "GPT-4o, GPT-4o-mini", icon: "🤖" },
  { name: "Anthropic", description: "Claude 3.5 Sonnet", icon: "🧠" },
  { name: "Slack", description: "Powiadomienia i kanały", icon: "💬" },
  { name: "Zapier", description: "Automatyzacja workflow", icon: "⚡" },
  { name: "Google Sheets", description: "Eksport danych", icon: "📊" },
  { name: "Stripe", description: "Płatności i subskrypcje", icon: "💳" },
];

export interface UserIntegration {
  id: string;
  integration_name: string;
  api_key: string;
  enabled: boolean;
}

export function useIntegrations() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["user_integrations"];

  const { data: userIntegrations = [], isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_integrations")
        .select("id, integration_name, api_key, enabled");
      if (error) throw error;
      return data as UserIntegration[];
    },
  });

  const connectMutation = useMutation({
    mutationFn: async ({ name, apiKey }: { name: string; apiKey: string }) => {
      const { error } = await supabase.from("user_integrations").insert({
        user_id: user!.id,
        integration_name: name,
        api_key: apiKey,
        enabled: true,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("user_integrations")
        .update({ enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_integrations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const getConnection = (name: string) =>
    userIntegrations.find((ui) => ui.integration_name === name);

  return {
    userIntegrations,
    isLoading,
    getConnection,
    connect: connectMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    disconnect: disconnectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
  };
}
