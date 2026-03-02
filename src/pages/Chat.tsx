import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Square, AlertTriangle, Loader2,
  Plus, MessageSquare, Trash2, Clock, Figma,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgents } from "@/hooks/useAgents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useConversations,
  useConversationMessages,
  useCreateConversation,
  useSaveMessage,
  useUpdateConversationTitle,
  useDeleteConversation,
} from "@/hooks/useConversations";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

type Msg = { role: "user" | "assistant" | "intervention"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;

const ChatPage = () => {
  const { data: agents } = useAgents();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isIntervening, setIsIntervening] = useState(false);
  const [interventionText, setInterventionText] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [isFigmaOpen, setIsFigmaOpen] = useState(false);
  const [isFigmaLoading, setIsFigmaLoading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useConversations();
  const { data: savedMessages } = useConversationMessages(activeConversationId);
  const createConversation = useCreateConversation();
  const saveMessage = useSaveMessage();
  const updateTitle = useUpdateConversationTitle();
  const deleteConversation = useDeleteConversation();

  const selectedAgent = agents?.find((a) => a.id === selectedAgentId);

  // Load messages when switching conversations
  useEffect(() => {
    if (savedMessages) {
      setMessages(savedMessages.map((m) => ({ role: m.role as Msg["role"], content: m.content })));
    }
  }, [savedMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopStream = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
  };

  const loadConversation = (convId: string, agentId: string | null) => {
    setActiveConversationId(convId);
    if (agentId) setSelectedAgentId(agentId);
  };

  const handleDeleteConversation = async (convId: string) => {
    if (convId === activeConversationId) {
      startNewConversation();
    }
    deleteConversation.mutate(convId);
  };

  const FIGMA_FETCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/figma-fetch`;

  const handleFigmaImport = async () => {
    const match = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match) {
      toast({ title: "Błąd", description: "Nieprawidłowy URL Figma. Wklej link do pliku Figma.", variant: "destructive" });
      return;
    }
    const fileKey = match[1];
    setIsFigmaLoading(true);

    try {
      const resp = await fetch(FIGMA_FETCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ fileKey }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Błąd pobierania" }));
        toast({ title: "Błąd Figma", description: err.error, variant: "destructive" });
        return;
      }

      const figmaData = await resp.json();

      // Build image gallery markdown
      const imageSection = figmaData.frameImages?.length
        ? `\n**Podgląd ramek (${figmaData.frameImages.length}):**\n${figmaData.frameImages.map((f: any) => `![${f.name}](${f.imageUrl})`).join("\n")}`
        : "";

      const summary = [
        `📐 **Plik Figma: ${figmaData.name}**`,
        `\n**Kolory (${figmaData.colors?.length || 0}):** ${figmaData.colors?.slice(0, 15).join(", ") || "brak"}`,
        `\n**Typografia (${figmaData.typography?.length || 0}):**`,
        ...(figmaData.typography?.slice(0, 8).map((t: any) => `- ${t.fontFamily} ${t.fontWeight} ${t.fontSize}px`) || []),
        `\n**Komponenty (${figmaData.components?.length || 0}):**`,
        ...(figmaData.components?.slice(0, 15).map((c: any) => `- ${c.name} (${c.type})`) || []),
        imageSection,
      ].join("\n");

      const figmaContext = `Analizuj poniższe dane z Figma i zaproponuj implementację w React/Tailwind:\n\n${summary}`;
      setInput(figmaContext);
      setIsFigmaOpen(false);
      setFigmaUrl("");
      toast({ title: "Figma", description: `Pobrano design "${figmaData.name}" z ${figmaData.frameImages?.length || 0} podglądami` });
    } catch (e) {
      toast({ title: "Błąd", description: "Nie udało się połączyć z Figma API", variant: "destructive" });
    } finally {
      setIsFigmaLoading(false);
    }
  };

  const sendMessage = useCallback(async (text: string, isIntervention = false) => {
    if (!text.trim() || isLoading) return;
    if (!user) {
      toast({ title: "Wymagane logowanie", description: "Zaloguj się, aby korzystać z czatu", variant: "destructive" });
      return;
    }

    const userMsg: Msg = {
      role: isIntervention ? "intervention" : "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (isIntervention) {
      setInterventionText("");
      setIsIntervening(false);
    } else {
      setInput("");
    }
    setIsLoading(true);

    // Create conversation if new
    let convId = activeConversationId;
    if (!convId) {
      try {
        const title = text.trim().slice(0, 60) || "Nowa rozmowa";
        const conv = await createConversation.mutateAsync({
          agentId: selectedAgentId,
          title,
        });
        convId = conv.id;
        setActiveConversationId(conv.id);
      } catch (e) {
        toast({ title: "Błąd", description: "Nie udało się utworzyć konwersacji", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    // Save user message
    saveMessage.mutate({
      conversationId: convId,
      role: userMsg.role,
      content: userMsg.content,
    });

    const controller = new AbortController();
    abortRef.current = controller;

    const apiMessages = [...messages, userMsg].map((m) =>
      m.role === "intervention"
        ? { role: "system" as const, content: `[INTERWENCJA OPERATORA]: ${m.content}` }
        : { role: m.role as "user" | "assistant", content: m.content }
    );

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          agentConfig: selectedAgent
            ? {
                system_prompt: selectedAgent.system_prompt,
                temperature: selectedAgent.temperature,
                max_tokens: selectedAgent.max_tokens,
              }
            : undefined,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Błąd połączenia" }));
        toast({ title: "Błąd", description: err.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("Brak strumienia");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant response
      if (assistantSoFar && convId) {
        saveMessage.mutate({
          conversationId: convId,
          role: "assistant",
          content: assistantSoFar,
        });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ title: "Błąd", description: "Nie udało się połączyć z agentem", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading, user, activeConversationId, messages, selectedAgentId, selectedAgent, createConversation, saveMessage, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen">
        {/* History sidebar */}
        {user && (
          <div className="w-64 border-r border-border flex flex-col flex-shrink-0 bg-card/30">
            <div className="p-3 border-b border-border">
              <Button
                onClick={startNewConversation}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nowa rozmowa
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations?.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                      conv.id === activeConversationId
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    onClick={() => loadConversation(conv.id, conv.agent_id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: pl })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {conversations?.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Brak zapisanych rozmów
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-border flex items-center gap-4 flex-shrink-0">
            <Bot className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Czat z Agentem</h1>
            <div className="ml-auto w-64">
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Wybierz agenta..." />
                </SelectTrigger>
                <SelectContent>
                  {agents?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 lg:p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">
                    {user ? "Wybierz agenta i rozpocznij rozmowę" : "Zaloguj się, aby zapisywać rozmowy"}
                  </p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role !== "user" && (
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.role === "intervention"
                            ? "bg-[hsl(var(--warning))]/20"
                            : "bg-primary/10"
                        }`}
                      >
                        {msg.role === "intervention" ? (
                          <AlertTriangle className="w-4 h-4 text-[hsl(var(--warning))]" />
                        ) : (
                          <Bot className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : msg.role === "intervention"
                          ? "bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 text-foreground"
                          : "glass-card text-foreground"
                      }`}
                    >
                      {msg.role === "intervention" && (
                        <p className="text-xs font-semibold text-[hsl(var(--warning))] mb-1">
                          Interwencja operatora
                        </p>
                      )}
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0">
                        <ReactMarkdown
                          components={{
                            img: ({ src, alt }) => (
                              <img
                                src={src}
                                alt={alt || ""}
                                loading="lazy"
                                onClick={() => src && setLightboxSrc(src)}
                                className="rounded-lg max-h-48 w-auto my-2 border border-border cursor-pointer hover:opacity-80 transition-opacity"
                              />
                            ),
                          }}
                        >{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                  <div className="glass-card px-4 py-3 text-sm text-muted-foreground">
                    Agent pisze...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Intervention bar */}
          {isIntervening && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-3"
            >
              <div className="max-w-3xl mx-auto flex gap-2 items-end">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--warning))] flex-shrink-0 mb-2" />
                <Textarea
                  value={interventionText}
                  onChange={(e) => setInterventionText(e.target.value)}
                  placeholder="Instrukcja interwencji dla agenta..."
                  className="min-h-[40px] max-h-[100px] bg-background border-[hsl(var(--warning))]/30 text-sm"
                  rows={1}
                />
                <Button
                  size="sm"
                  onClick={() => sendMessage(interventionText, true)}
                  disabled={!interventionText.trim()}
                  className="bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))]/80"
                >
                  Wyślij
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsIntervening(false)}>
                  Anuluj
                </Button>
              </div>
            </motion.div>
          )}

          {/* Figma import bar */}
          {isFigmaOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-primary/30 bg-primary/5 p-3"
            >
              <div className="max-w-3xl mx-auto flex gap-2 items-center">
                <Figma className="w-5 h-5 text-primary flex-shrink-0" />
                <Input
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/design/XXXXX/..."
                  className="bg-background border-primary/30 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleFigmaImport}
                  disabled={!figmaUrl.trim() || isFigmaLoading}
                >
                  {isFigmaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pobierz"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsFigmaOpen(false)}>
                  Anuluj
                </Button>
              </div>
            </motion.div>
          )}

          {/* Input */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2 items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFigmaOpen(!isFigmaOpen)}
                className="flex-shrink-0 mb-0.5 text-xs"
                title="Importuj z Figma"
              >
                <Figma className="w-3.5 h-3.5 mr-1" />
                Figma
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsIntervening(!isIntervening)}
                className="flex-shrink-0 mb-0.5 text-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Interwencja
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedAgent ? `Napisz do ${selectedAgent.name}...` : "Wybierz agenta..."}
                className="min-h-[44px] max-h-[120px] bg-secondary border-border text-sm resize-none"
                rows={1}
                disabled={!selectedAgentId}
              />
              {isLoading ? (
                <Button size="icon" variant="destructive" onClick={stopStream} className="flex-shrink-0">
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || !selectedAgentId}
                  className="flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightboxSrc} onOpenChange={() => setLightboxSrc(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 backdrop-blur-sm border-border">
          {lightboxSrc && (
            <img
              src={lightboxSrc}
              alt="Podgląd ramki Figma"
              className="w-full h-full object-contain rounded-lg max-h-[85vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ChatPage;
