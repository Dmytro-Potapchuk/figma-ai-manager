import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { AgentList } from "@/components/AgentList";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ConversationsChart } from "@/components/charts/ConversationsChart";
import { AgentEffectivenessChart } from "@/components/charts/AgentEffectivenessChart";
import { UsageDistributionChart } from "@/components/charts/UsageDistributionChart";
import { AgentFormDialog } from "@/components/AgentFormDialog";
import { Bot, MessageSquare, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAgents } from "@/hooks/useAgents";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Index = () => {
  const { data: agents } = useAgents();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const activeCount = agents?.filter((a) => a.status === "online").length ?? 0;
  const totalConversations = agents?.reduce((sum, a) => sum + (a.conversations_count ?? 0), 0) ?? 0;
  const avgSuccess = agents?.length
    ? (agents.reduce((sum, a) => sum + Number(a.success_rate ?? 0), 0) / agents.length).toFixed(1)
    : "0";
  const errorCount = agents?.filter((a) => a.status === "error").length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Zarządzaj swoimi agentami AI w jednym miejscu
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nowy Agent
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Aktywni Agenci" value={activeCount} icon={Bot} index={0} />
          <StatCard title="Rozmowy łącznie" value={totalConversations.toLocaleString()} icon={MessageSquare} index={1} />
          <StatCard title="Śr. skuteczność" value={`${avgSuccess}%`} icon={TrendingUp} index={2} />
          <StatCard title="Agenci z błędem" value={errorCount} icon={AlertTriangle} index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversationsChart />
          <AgentEffectivenessChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UsageDistributionChart />
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Agenci</h2>
              <span className="text-sm text-muted-foreground font-mono">{agents?.length ?? 0} agentów</span>
            </div>
            <AgentList />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Ostatnia aktywność</h2>
            <span className="text-xs text-muted-foreground">Na żywo</span>
          </div>
          <div className="glass-card p-2">
            <ActivityFeed />
          </div>
        </div>
      </div>

      <AgentFormDialog open={showForm} onClose={() => setShowForm(false)} />
    </DashboardLayout>
  );
};

export default Index;
