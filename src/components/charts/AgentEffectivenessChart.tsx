import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAgents } from "@/hooks/useAgents";
import { Skeleton } from "@/components/ui/skeleton";

const getBarColor = (value: number) => {
  if (value >= 95) return "hsl(145, 65%, 45%)";
  if (value >= 85) return "hsl(175, 80%, 50%)";
  if (value >= 80) return "hsl(38, 90%, 55%)";
  return "hsl(0, 70%, 55%)";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-border">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-primary font-mono">{payload[0]?.value}%</p>
    </div>
  );
};

export function AgentEffectivenessChart() {
  const { data: agents, isLoading } = useAgents();

  if (isLoading) return <Skeleton className="h-[360px] rounded-xl" />;

  const chartData = agents?.map((a) => ({
    name: a.name,
    skutecznosc: Number(a.success_rate ?? 0),
  })) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Skuteczność agentów</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Procent pomyślnie obsłużonych rozmów</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="skutecznosc" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.skutecznosc)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
