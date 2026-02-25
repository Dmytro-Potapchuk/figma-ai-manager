import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { AgentList } from "@/components/AgentList";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Bot, MessageSquare, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Nowy Agent
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Aktywni Agenci" value={3} change="+1" icon={Bot} index={0} />
          <StatCard title="Rozmowy dziś" value="1,247" change="+12.5%" icon={MessageSquare} index={1} />
          <StatCard title="Śr. skuteczność" value="89.4%" change="+2.1%" icon={TrendingUp} index={2} />
          <StatCard title="Błędy (24h)" value={7} change="-23%" icon={AlertTriangle} index={3} />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Agenci</h2>
              <span className="text-sm text-muted-foreground font-mono">5 agentów</span>
            </div>
            <AgentList />
          </div>

          {/* Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Aktywność</h2>
              <span className="text-xs text-muted-foreground">Na żywo</span>
            </div>
            <div className="glass-card p-2">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
