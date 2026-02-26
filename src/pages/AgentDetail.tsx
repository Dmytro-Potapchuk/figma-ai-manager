import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAgent } from "@/hooks/useAgents";
import { StatusBadge } from "@/components/StatusBadge";
import { AgentFormDialog } from "@/components/AgentFormDialog";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Play, Pause, RotateCcw, Trash2, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const AgentDetailPage = () => {
  const { id } = useParams();
  const { data: agent, isLoading } = useAgent(id);
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isOwner = user && agent?.user_id === user.id;

  const handleDelete = async () => {
    if (!agent || !confirm("Czy na pewno chcesz usunąć tego agenta?")) return;
    const { error } = await supabase.from("agents").delete().eq("id", agent.id);
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({ title: "Agent usunięty" });
      navigate("/agents");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Agent nie znaleziony</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Powrót do listy
        </Link>

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
              <StatusBadge status={agent.status as "online" | "offline" | "error" | "training"} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
              >
                <Pencil className="w-4 h-4" /> Edytuj
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Rozmowy", value: (agent.conversations_count ?? 0).toLocaleString() },
            { label: "Skuteczność", value: `${agent.success_rate ?? 0}%` },
            { label: "Model", value: agent.model },
            { label: "Status", value: agent.status },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-mono font-semibold text-foreground mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Konfiguracja</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Model", value: agent.model },
              { label: "Temperatura", value: String(agent.temperature ?? 0.7) },
              { label: "Max tokenów", value: String(agent.max_tokens ?? 4096) },
              { label: "System prompt", value: agent.system_prompt || "" },
              { label: "Język", value: agent.language || "Polski" },
              { label: "Timeout (s)", value: String(agent.timeout_seconds ?? 30) },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs text-muted-foreground mb-1.5">{field.label}</label>
                <input
                  type="text"
                  defaultValue={field.value}
                  readOnly={!isOwner}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring read-only:opacity-60"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AgentFormDialog open={showEdit} onClose={() => setShowEdit(false)} agent={agent} />
    </DashboardLayout>
  );
};

export default AgentDetailPage;
