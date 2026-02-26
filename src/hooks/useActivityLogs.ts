import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function useActivityLogs() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("activity-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, agents(name)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}
