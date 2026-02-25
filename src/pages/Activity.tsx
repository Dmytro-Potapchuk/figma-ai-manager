import { DashboardLayout } from "@/components/DashboardLayout";
import { ActivityFeed } from "@/components/ActivityFeed";
import { motion } from "framer-motion";

const ActivityPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Aktywność</h1>
          <p className="text-muted-foreground text-sm mt-1">Historia działań wszystkich agentów</p>
        </motion.div>
        <div className="glass-card p-4">
          <ActivityFeed />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActivityPage;
