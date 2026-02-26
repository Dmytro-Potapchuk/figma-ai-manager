import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { useUsageCategories } from "@/hooks/useUsageCategories";
import { Skeleton } from "@/components/ui/skeleton";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-border">
      <p className="font-medium text-foreground">{payload[0]?.name}</p>
      <p className="font-mono" style={{ color: payload[0]?.payload?.color }}>{payload[0]?.value}%</p>
    </div>
  );
};

export function UsageDistributionChart() {
  const { data, isLoading } = useUsageCategories();

  if (isLoading) return <Skeleton className="h-[280px] rounded-xl" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card p-6"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Rozkład użycia</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Podział konwersacji według kategorii</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
              {data?.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2.5">
          {data?.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground text-xs">{item.name}</span>
              </div>
              <span className="font-mono text-foreground text-xs">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
