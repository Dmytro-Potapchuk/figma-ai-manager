import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { Bot, MoreVertical, Play, Pause, Settings } from "lucide-react";
import { Link } from "react-router-dom";

type AgentStatus = "online" | "offline" | "error" | "training";

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  model: string;
  conversations: number;
  successRate: number;
  lastActive: string;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Asystent Klienta",
    description: "Obsługa zapytań klientów i pomoc techniczna",
    status: "online",
    model: "GPT-4o",
    conversations: 1247,
    successRate: 94.2,
    lastActive: "Teraz",
  },
  {
    id: "2",
    name: "Agent Sprzedażowy",
    description: "Automatyzacja procesu sprzedaży i leadów",
    status: "online",
    model: "GPT-4o",
    conversations: 832,
    successRate: 87.5,
    lastActive: "2 min temu",
  },
  {
    id: "3",
    name: "Analityk Danych",
    description: "Analiza raportów i generowanie insightów",
    status: "training",
    model: "Claude 3.5",
    conversations: 156,
    successRate: 91.0,
    lastActive: "1h temu",
  },
  {
    id: "4",
    name: "Bot HR",
    description: "Odpowiedzi na pytania pracowników i onboarding",
    status: "offline",
    model: "GPT-4o-mini",
    conversations: 423,
    successRate: 96.1,
    lastActive: "Wczoraj",
  },
  {
    id: "5",
    name: "Moderator Treści",
    description: "Automatyczna moderacja i filtrowanie treści",
    status: "error",
    model: "GPT-4o",
    conversations: 2103,
    successRate: 78.3,
    lastActive: "5 min temu",
  },
];

export function AgentList() {
  return (
    <div className="space-y-3">
      {mockAgents.map((agent, i) => (
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
                <StatusBadge status={agent.status} />
              </div>
              <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <div className="text-center">
                <p className="font-mono text-foreground">{agent.conversations.toLocaleString()}</p>
                <p className="text-muted-foreground text-xs">Rozmowy</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-foreground">{agent.successRate}%</p>
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

export { mockAgents };
