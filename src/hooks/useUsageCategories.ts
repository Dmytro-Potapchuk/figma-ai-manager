import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUsageCategories() {
  return useQuery({
    queryKey: ["usage-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usage_categories").select("*");
      if (error) throw error;
      return data.map((c) => ({
        name: c.name,
        value: Number(c.percentage),
        color: c.color,
      }));
    },
  });
}
