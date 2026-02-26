import { motion } from "framer-motion";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

const iconMap: Record<string, typeof CheckCircle> = {
  conversation: CheckCircle,
  deployment: CheckCircle,
  error: AlertCircle,
  training: MessageSquare,
};

const colorMap: Record<string, string> = {
  conversation: "text-success",
  deployment: "text-success",
  error: "text-destructive",
  training: "text-primary",
};

export function ActivityFeed() {
  const { data: logs, isLoading } = useActivityLogs();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs?.map((item, i) => {
        const Icon = iconMap[item.event_type] || MessageSquare;
        const color = colorMap[item.event_type] || "text-primary";
        const agentName = (item.agents as any)?.name ?? "Agent";
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{agentName}</span>
                <span className="text-muted-foreground"> — {item.event_type}</span>
              </p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span className="font-mono">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: pl })}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
