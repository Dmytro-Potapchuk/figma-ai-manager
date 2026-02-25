import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { MessageSquare, Bot, Clock } from "lucide-react";

const conversations = [
  { id: "1", agent: "Asystent Klienta", user: "Jan Kowalski", preview: "Dzień dobry, mam problem z zamówieniem...", time: "2 min temu", messages: 12 },
  { id: "2", agent: "Agent Sprzedażowy", user: "Anna Nowak", preview: "Czy mogę zapytać o cennik enterprise?", time: "8 min temu", messages: 6 },
  { id: "3", agent: "Bot HR", user: "Piotr Wiśniewski", preview: "Ile dni urlopu mi jeszcze zostało?", time: "45 min temu", messages: 4 },
  { id: "4", agent: "Asystent Klienta", user: "Maria Zielińska", preview: "Chciałabym reklamować produkt...", time: "1h temu", messages: 18 },
  { id: "5", agent: "Analityk Danych", user: "Tomasz Lewandowski", preview: "Proszę o raport sprzedaży za styczeń", time: "2h temu", messages: 8 },
];

const ConversationsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Konwersacje</h1>
          <p className="text-muted-foreground text-sm mt-1">Przegląd wszystkich rozmów agentów</p>
        </motion.div>

        <div className="space-y-3">
          {conversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center gap-4 hover:glow-border transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{conv.user}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Bot className="w-3 h-3" /> {conv.agent}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conv.preview}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{conv.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{conv.messages} wiad.</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationsPage;
