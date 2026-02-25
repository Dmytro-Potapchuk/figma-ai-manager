import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Zap, CheckCircle } from "lucide-react";

const integrations = [
  { name: "OpenAI", description: "GPT-4o, GPT-4o-mini", connected: true, icon: "🤖" },
  { name: "Anthropic", description: "Claude 3.5 Sonnet", connected: true, icon: "🧠" },
  { name: "Slack", description: "Powiadomienia i kanały", connected: true, icon: "💬" },
  { name: "Zapier", description: "Automatyzacja workflow", connected: false, icon: "⚡" },
  { name: "Google Sheets", description: "Eksport danych", connected: false, icon: "📊" },
  { name: "Stripe", description: "Płatności i subskrypcje", connected: false, icon: "💳" },
];

const IntegrationsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Integracje</h1>
          <p className="text-muted-foreground text-sm mt-1">Połączenia z zewnętrznymi serwisami</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 flex flex-col gap-4 hover:glow-border transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {item.connected && <CheckCircle className="w-5 h-5 text-success" />}
              </div>
              <button
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.connected
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {item.connected ? "Konfiguruj" : "Połącz"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IntegrationsPage;
