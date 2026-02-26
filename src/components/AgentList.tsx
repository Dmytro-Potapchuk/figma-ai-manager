import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { Bot, Pause, Play, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

export function AgentList() {
  const { data: agents, isLoading } = useAgents();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents?.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <Link
            to={`/agents/${agent.id}`}
            className="glass-card flex items-center gap-4 p-4 hover:glow-border transition-all duration-300 group block"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Bot className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
                <StatusBadge status={agent.status as "online" | "offline" | "error" | "training"} />
              </div>
              <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <div className="text-center">
                <p className="font-mono text-foreground">{(agent.conversations_count ?? 0).toLocaleString()}</p>
                <p className="text-muted-foreground text-xs">Rozmowy</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-foreground">{agent.success_rate ?? 0}%</p>
                <p className="text-muted-foreground text-xs">Skuteczność</p>
              </div>
              <div className="text-center">
                <p className="text-foreground font-mono text-xs">{agent.model}</p>
                <p className="text-muted-foreground text-xs">Model</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {agent.status === "online" ? (
                <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              )}
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
