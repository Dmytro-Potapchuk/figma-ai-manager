import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { MessageSquare, Bot, Clock, Download, FileText, FileDown } from "lucide-react";
import { useConversations, useConversationMessages } from "@/hooks/useConversations";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const ConversationsPage = () => {
  const { data: conversations, isLoading } = useConversations();
  const [previewConvId, setPreviewConvId] = useState<string | null>(null);
  const { data: previewMessages } = useConversationMessages(previewConvId);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const exportTxt = async (convId: string, title: string) => {
    try {
      const { data: msgs, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const lines = msgs.map((m) => {
        const roleLabel =
          m.role === "user" ? "Użytkownik" : m.role === "assistant" ? "Asystent" : "Interwencja";
        const time = new Date(m.created_at).toLocaleString("pl-PL");
        return `[${time}] ${roleLabel}:\n${m.content}\n`;
      });

      const blob = new Blob([lines.join("\n---\n\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "konwersacja"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Wyeksportowano do TXT" });
    } catch {
      toast({ title: "Błąd eksportu", variant: "destructive" });
    }
  };

  const exportPdf = async (convId: string, title: string) => {
    // Open preview dialog first, then export from rendered content
    setPreviewConvId(convId);
    // Wait for render
    setTimeout(async () => {
      const el = printRef.current;
      if (!el) {
        toast({ title: "Błąd eksportu PDF", variant: "destructive" });
        return;
      }
      try {
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${title || "konwersacja"}.pdf`);
        toast({ title: "Wyeksportowano do PDF" });
      } catch {
        toast({ title: "Błąd eksportu PDF", variant: "destructive" });
      }
      setPreviewConvId(null);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Konwersacje</h1>
          <p className="text-muted-foreground text-sm mt-1">Przegląd wszystkich rozmów agentów</p>
        </motion.div>

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-12">Ładowanie...</p>
        )}

        {!isLoading && (!conversations || conversations.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-12">
            Brak zapisanych konwersacji. Rozpocznij rozmowę w zakładce Czat AI.
          </p>
        )}

        <div className="space-y-3">
          {conversations?.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center gap-4 hover:glow-border transition-all duration-300 cursor-pointer"
              onClick={() => setPreviewConvId(conv.id)}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{conv.title}</span>
                  {(conv as any).agents?.name && (
                    <>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Bot className="w-3 h-3" /> {(conv as any).agents.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: pl })}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => exportTxt(conv.id, conv.title)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Eksport TXT
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportPdf(conv.id, conv.title)}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Eksport PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview / PDF render dialog */}
      <Dialog open={!!previewConvId} onOpenChange={(o) => !o && setPreviewConvId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Podgląd konwersacji</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div ref={printRef} className="space-y-3 p-4 bg-background">
              {previewMessages?.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role !== "user" && (
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : m.role === "intervention"
                        ? "bg-accent border border-border text-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <p className="text-[10px] text-muted-foreground mb-1">
                      {m.role === "user" ? "Ty" : m.role === "assistant" ? "Asystent" : "Interwencja"} ·{" "}
                      {new Date(m.created_at).toLocaleString("pl-PL")}
                    </p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {previewMessages?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Brak wiadomości</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ConversationsPage;
