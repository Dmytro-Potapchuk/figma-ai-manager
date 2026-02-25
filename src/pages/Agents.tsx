import { DashboardLayout } from "@/components/DashboardLayout";
import { AgentList } from "@/components/AgentList";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const AgentsPage = () => {
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenci AI</h1>
            <p className="text-muted-foreground text-sm mt-1">Zarządzaj konfiguracją i statusem agentów</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            Nowy Agent
          </button>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj agentów..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <AgentList />
      </div>
    </DashboardLayout>
  );
};

export default AgentsPage;
