import { motion } from "framer-motion";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  detail: string;
  time: string;
  type: "success" | "error" | "info";
}

const activities: ActivityItem[] = [
  { id: "1", agent: "Asystent Klienta", action: "Rozwiązał zgłoszenie", detail: "#4521 - Problem z płatnością", time: "2 min temu", type: "success" },
  { id: "2", agent: "Agent Sprzedażowy", action: "Nowy lead", detail: "Jan Kowalski - Enterprise", time: "5 min temu", type: "info" },
  { id: "3", agent: "Moderator Treści", action: "Błąd API", detail: "Timeout połączenia z GPT-4o", time: "8 min temu", type: "error" },
  { id: "4", agent: "Analityk Danych", action: "Raport gotowy", detail: "Analiza Q4 2025 zakończona", time: "15 min temu", type: "success" },
  { id: "5", agent: "Asystent Klienta", action: "Eskalacja", detail: "#4519 - Zwrot towaru", time: "22 min temu", type: "info" },
  { id: "6", agent: "Bot HR", action: "Odpowiedział", detail: "Pytanie o urlop - Anna N.", time: "1h temu", type: "success" },
];

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: MessageSquare,
};

const colorMap = {
  success: "text-success",
  error: "text-destructive",
  info: "text-primary",
};

export function ActivityFeed() {
  return (
    <div className="space-y-1">
      {activities.map((item, i) => {
        const Icon = iconMap[item.type];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorMap[item.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.agent}</span>
                <span className="text-muted-foreground"> — {item.action}</span>
              </p>
              <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{item.time}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
