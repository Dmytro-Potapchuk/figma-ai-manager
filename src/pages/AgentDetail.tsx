import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams, Link } from "react-router-dom";
import { mockAgents } from "@/components/AgentList";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Play, Pause, RotateCcw, Trash2 } from "lucide-react";

const AgentDetailPage = () => {
  const { id } = useParams();
  const agent = mockAgents.find((a) => a.id === id);

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Agent nie znaleziony</div>
      </DashboardLayout>
    );
  }

  const configFields = [
    { label: "Model", value: agent.model },
    { label: "Temperatura", value: "0.7" },
    { label: "Max tokenów", value: "4096" },
    { label: "System prompt", value: "Jesteś pomocnym asystentem..." },
    { label: "Język", value: "Polski" },
    { label: "Timeout (s)", value: "30" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Back */}
        <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Powrót do listy
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{agent.name}</h1>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {agent.status === "online" ? (
              <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors">
                <Pause className="w-4 h-4" /> Zatrzymaj
              </button>
            ) : (
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
                <Play className="w-4 h-4" /> Uruchom
              </button>
            )}
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Rozmowy", value: agent.conversations.toLocaleString() },
            { label: "Skuteczność", value: `${agent.successRate}%` },
            { label: "Ost. aktywność", value: agent.lastActive },
            { label: "Model", value: agent.model },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-mono font-semibold text-foreground mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">Konfiguracja</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configFields.map((field) => (
              <div key={field.label}>
                <label className="block text-xs text-muted-foreground mb-1.5">{field.label}</label>
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Zapisz zmiany
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDetailPage;
