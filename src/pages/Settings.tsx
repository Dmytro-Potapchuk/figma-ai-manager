import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Ustawienia</h1>
          <p className="text-muted-foreground text-sm mt-1">Globalne ustawienia platformy</p>
        </motion.div>

        <div className="space-y-6 max-w-2xl">
          {/* API Keys */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Klucze API</h2>
            {["OpenAI", "Anthropic"].map((provider) => (
              <div key={provider}>
                <label className="block text-xs text-muted-foreground mb-1.5">{provider} API Key</label>
                <input
                  type="password"
                  defaultValue="sk-••••••••••••••••••••"
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
          </motion.div>

          {/* General */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Ogólne</h2>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Nazwa organizacji</label>
              <input
                type="text"
                defaultValue="Moja Firma"
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Domyślny język agentów</label>
              <select className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Polski</option>
                <option>English</option>
                <option>Deutsch</option>
              </select>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Zapisz ustawienia
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
