import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Pon", konwersacje: 180, rozwiazane: 162 },
  { name: "Wt", konwersacje: 220, rozwiazane: 198 },
  { name: "Śr", konwersacje: 310, rozwiazane: 275 },
  { name: "Czw", konwersacje: 280, rozwiazane: 252 },
  { name: "Pt", konwersacje: 350, rozwiazane: 322 },
  { name: "Sob", konwersacje: 120, rozwiazane: 115 },
  { name: "Nd", konwersacje: 90, rozwiazane: 86 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-border">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === "konwersacje" ? "Konwersacje" : "Rozwiązane"}: <span className="font-mono">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function ConversationsChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Konwersacje w czasie</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Ostatnie 7 dni</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Wszystkie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground">Rozwiązane</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(145, 65%, 45%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(145, 65%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="konwersacje" stroke="hsl(175, 80%, 50%)" strokeWidth={2} fill="url(#gradConv)" />
          <Area type="monotone" dataKey="rozwiazane" stroke="hsl(145, 65%, 45%)" strokeWidth={2} fill="url(#gradResolved)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
