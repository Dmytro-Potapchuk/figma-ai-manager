import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AgentFormDialogProps {
  open: boolean;
  onClose: () => void;
  agent?: {
    id: string;
    name: string;
    description: string | null;
    model: string;
    temperature: number | null;
    max_tokens: number | null;
    system_prompt: string | null;
    language: string | null;
    timeout_seconds: number | null;
  } | null;
}

export function AgentFormDialog({ open, onClose, agent }: AgentFormDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!agent;

  const [form, setForm] = useState({
    name: agent?.name ?? "",
    description: agent?.description ?? "",
    model: agent?.model ?? "GPT-4o",
    temperature: String(agent?.temperature ?? 0.7),
    max_tokens: String(agent?.max_tokens ?? 4096),
    system_prompt: agent?.system_prompt ?? "",
    language: agent?.language ?? "Polski",
    timeout_seconds: String(agent?.timeout_seconds ?? 30),
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        model: form.model,
        temperature: parseFloat(form.temperature),
        max_tokens: parseInt(form.max_tokens),
        system_prompt: form.system_prompt,
        language: form.language,
        timeout_seconds: parseInt(form.timeout_seconds),
        user_id: user.id,
      };

      if (isEdit && agent) {
        const { error } = await supabase.from("agents").update(payload).eq("id", agent.id);
        if (error) throw error;
        toast({ title: "Agent zaktualizowany!" });
      } else {
        const { error } = await supabase.from("agents").insert(payload);
        if (error) throw error;
        toast({ title: "Agent utworzony!" });
      }

      queryClient.invalidateQueries({ queryKey: ["agents"] });
      onClose();
    } catch (error: any) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edytuj agenta" : "Nowy agent"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Nazwa</label>
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Opis</label>
            <input value={form.description} onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Model</label>
              <select value={form.model} onChange={(e) => handleChange("model", e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>GPT-4o</option>
                <option>GPT-4o-mini</option>
                <option>Claude 3.5</option>
                <option>Claude 3 Opus</option>
                <option>Gemini Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Temperatura</label>
              <input type="number" step="0.1" min="0" max="2" value={form.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Max tokenów</label>
              <input type="number" value={form.max_tokens} onChange={(e) => handleChange("max_tokens", e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Timeout (s)</label>
              <input type="number" value={form.timeout_seconds} onChange={(e) => handleChange("timeout_seconds", e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">System prompt</label>
            <textarea value={form.system_prompt} onChange={(e) => handleChange("system_prompt", e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Anuluj
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Zapisywanie..." : isEdit ? "Zapisz zmiany" : "Utwórz agenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
