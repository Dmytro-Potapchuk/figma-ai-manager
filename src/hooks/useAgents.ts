import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useAgents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("agents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agents" }, () => {
        queryClient.invalidateQueries({ queryKey: ["agents"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ["agents", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("agents").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
