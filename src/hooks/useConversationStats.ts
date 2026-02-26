import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useConversationStats() {
  return useQuery({
    queryKey: ["conversation-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversation_stats")
        .select("*")
        .order("date");
      if (error) throw error;

      // Aggregate by date
      const byDate = new Map<string, { total: number; resolved: number }>();
      for (const row of data) {
        const existing = byDate.get(row.date) || { total: 0, resolved: 0 };
        existing.total += row.total_conversations ?? 0;
        existing.resolved += row.resolved_conversations ?? 0;
        byDate.set(row.date, existing);
      }

      const dayNames = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];
      return Array.from(byDate.entries()).map(([date, stats]) => ({
        name: dayNames[new Date(date).getDay()],
        konwersacje: stats.total,
        rozwiazane: stats.resolved,
      }));
    },
  });
}
