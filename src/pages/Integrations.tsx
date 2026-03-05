import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { CheckCircle, Copy, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Integration {
  name: string;
  description: string;
  connected: boolean;
  icon: string;
  apiKey?: string;
  enabled?: boolean;
}

const initialIntegrations: Integration[] = [
  { name: "OpenAI", description: "GPT-4o, GPT-4o-mini", connected: true, icon: "🤖", apiKey: "sk-••••••••••••", enabled: true },
  { name: "Anthropic", description: "Claude 3.5 Sonnet", connected: true, icon: "🧠", apiKey: "sk-ant-••••••••", enabled: true },
  { name: "Slack", description: "Powiadomienia i kanały", connected: true, icon: "💬", apiKey: "xoxb-••••••••", enabled: false },
  { name: "Zapier", description: "Automatyzacja workflow", connected: false, icon: "⚡" },
  { name: "Google Sheets", description: "Eksport danych", connected: false, icon: "📊" },
  { name: "Stripe", description: "Płatności i subskrypcje", connected: false, icon: "💳" },
];

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [connectModal, setConnectModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [configModal, setConfigModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [newApiKey, setNewApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleConnect = () => {
    if (connectModal.index === null || !newApiKey.trim()) return;
    setIntegrations(prev => prev.map((item, i) =>
      i === connectModal.index ? { ...item, connected: true, apiKey: newApiKey, enabled: true } : item
    ));
    toast.success("Połączono pomyślnie");
    setConnectModal({ open: false, index: null });
    setNewApiKey("");
  };

  const handleDisconnect = (index: number) => {
    setIntegrations(prev => prev.map((item, i) =>
      i === index ? { ...item, connected: false, apiKey: undefined, enabled: undefined } : item
    ));
    toast.success("Rozłączono");
    setConfigModal({ open: false, index: null });
  };

  const handleToggle = (index: number, enabled: boolean) => {
    setIntegrations(prev => prev.map((item, i) =>
      i === index ? { ...item, enabled } : item
    ));
  };

  const currentConnect = connectModal.index !== null ? integrations[connectModal.index] : null;
  const currentConfig = configModal.index !== null ? integrations[configModal.index] : null;

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
                onClick={() => {
                  if (item.connected) {
                    setConfigModal({ open: true, index: i });
                  } else {
                    setConnectModal({ open: true, index: i });
                    setNewApiKey("");
                    setShowKey(false);
                  }
                }}
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

      {/* Connect Modal */}
      <Dialog open={connectModal.open} onOpenChange={(open) => { setConnectModal({ open, index: open ? connectModal.index : null }); setNewApiKey(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentConnect && <span className="text-xl">{currentConnect.icon}</span>}
              Połącz {currentConnect?.name}
            </DialogTitle>
            <DialogDescription>Wprowadź klucz API, aby połączyć integrację.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="api-key">{currentConnect?.name} API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConnectModal({ open: false, index: null })}>Anuluj</Button>
            <Button onClick={handleConnect} disabled={!newApiKey.trim()}>Połącz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <Dialog open={configModal.open} onOpenChange={(open) => setConfigModal({ open, index: open ? configModal.index : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentConfig && <span className="text-xl">{currentConfig.icon}</span>}
              Ustawienia {currentConfig?.name}
            </DialogTitle>
            <DialogDescription>Zarządzaj konfiguracją integracji.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <Label>Aktywna</Label>
              <Switch
                checked={currentConfig?.enabled ?? false}
                onCheckedChange={(checked) => configModal.index !== null && handleToggle(configModal.index, checked)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Klucz API</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm font-mono text-foreground truncate">
                  {currentConfig?.apiKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (currentConfig?.apiKey) {
                      navigator.clipboard.writeText(currentConfig.apiKey);
                      toast.success("Skopiowano");
                    }
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => configModal.index !== null && handleDisconnect(configModal.index)}>
              Rozłącz
            </Button>
            <Button variant="secondary" onClick={() => setConfigModal({ open: false, index: null })}>Zamknij</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default IntegrationsPage;
