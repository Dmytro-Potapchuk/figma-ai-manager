import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { CheckCircle, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useIntegrations, AVAILABLE_INTEGRATIONS } from "@/hooks/useIntegrations";

const IntegrationsPage = () => {
  const { getConnection, connect, update, updateKey, disconnect, isLoading, isConnecting, isUpdatingKey } = useIntegrations();
  const [connectModal, setConnectModal] = useState<{ open: boolean; name: string | null }>({ open: false, name: null });
  const [configModal, setConfigModal] = useState<{ open: boolean; name: string | null }>({ open: false, name: null });
  const [newApiKey, setNewApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const [updatedApiKey, setUpdatedApiKey] = useState("");

  const handleConnect = async () => {
    if (!connectModal.name || !newApiKey.trim()) return;
    try {
      await connect({ name: connectModal.name, apiKey: newApiKey.trim() });
      toast.success("Połączono pomyślnie");
      setConnectModal({ open: false, name: null });
      setNewApiKey("");
    } catch {
      toast.error("Błąd podczas łączenia");
    }
  };

  const handleDisconnect = async () => {
    const conn = configModal.name ? getConnection(configModal.name) : null;
    if (!conn) return;
    try {
      await disconnect(conn.id);
      toast.success("Rozłączono");
      setConfigModal({ open: false, name: null });
    } catch {
      toast.error("Błąd podczas rozłączania");
    }
  };

  const handleToggle = async (name: string, enabled: boolean) => {
    const conn = getConnection(name);
    if (!conn) return;
    try {
      await update({ id: conn.id, enabled });
    } catch {
      toast.error("Błąd aktualizacji");
    }
  };

  const currentConnectDef = connectModal.name ? AVAILABLE_INTEGRATIONS.find(i => i.name === connectModal.name) : null;
  const currentConfigDef = configModal.name ? AVAILABLE_INTEGRATIONS.find(i => i.name === configModal.name) : null;
  const currentConfigConn = configModal.name ? getConnection(configModal.name) : null;

  const maskKey = (key: string) => key.length > 8 ? key.slice(0, 4) + "••••••••" + key.slice(-4) : "••••••••";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Integracje</h1>
          <p className="text-muted-foreground text-sm mt-1">Połączenia z zewnętrznymi serwisami</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_INTEGRATIONS.map((item, i) => {
              const conn = getConnection(item.name);
              const connected = !!conn;
              return (
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
                    {connected && <CheckCircle className="w-5 h-5 text-success" />}
                  </div>
                  <button
                    onClick={() => {
                      if (connected) {
                        setConfigModal({ open: true, name: item.name });
                      } else {
                        setConnectModal({ open: true, name: item.name });
                        setNewApiKey("");
                        setShowKey(false);
                      }
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      connected
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {connected ? "Konfiguruj" : "Połącz"}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      <Dialog open={connectModal.open} onOpenChange={(open) => { setConnectModal({ open, name: open ? connectModal.name : null }); setNewApiKey(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentConnectDef && <span className="text-xl">{currentConnectDef.icon}</span>}
              Połącz {currentConnectDef?.name}
            </DialogTitle>
            <DialogDescription>Wprowadź klucz API, aby połączyć integrację.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="api-key">{currentConnectDef?.name} API Key</Label>
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
            <Button variant="secondary" onClick={() => setConnectModal({ open: false, name: null })}>Anuluj</Button>
            <Button onClick={handleConnect} disabled={!newApiKey.trim() || isConnecting}>
              {isConnecting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Połącz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <Dialog open={configModal.open} onOpenChange={(open) => setConfigModal({ open, name: open ? configModal.name : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentConfigDef && <span className="text-xl">{currentConfigDef.icon}</span>}
              Ustawienia {currentConfigDef?.name}
            </DialogTitle>
            <DialogDescription>Zarządzaj konfiguracją integracji.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <Label>Aktywna</Label>
              <Switch
                checked={currentConfigConn?.enabled ?? false}
                onCheckedChange={(checked) => configModal.name && handleToggle(configModal.name, checked)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Klucz API</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm font-mono text-foreground truncate">
                  {currentConfigConn ? maskKey(currentConfigConn.api_key) : ""}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (currentConfigConn?.api_key) {
                      navigator.clipboard.writeText(currentConfigConn.api_key);
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
            <Button variant="destructive" onClick={handleDisconnect}>Rozłącz</Button>
            <Button variant="secondary" onClick={() => setConfigModal({ open: false, name: null })}>Zamknij</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default IntegrationsPage;
