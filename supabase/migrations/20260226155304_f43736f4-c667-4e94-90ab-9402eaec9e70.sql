
-- Agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error', 'training')),
  model TEXT NOT NULL DEFAULT 'GPT-4o',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  system_prompt TEXT DEFAULT '',
  language TEXT DEFAULT 'Polski',
  timeout_seconds INTEGER DEFAULT 30,
  conversations_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily conversation stats
CREATE TABLE public.conversation_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_conversations INTEGER DEFAULT 0,
  resolved_conversations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage categories
CREATE TABLE public.usage_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_categories ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public read conversation_stats" ON public.conversation_stats FOR SELECT USING (true);
CREATE POLICY "Public read activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Public read usage_categories" ON public.usage_categories FOR SELECT USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;

-- Seed agents
INSERT INTO public.agents (name, description, status, model, conversations_count, success_rate, last_active) VALUES
  ('Asystent Klienta', 'Obsługa zapytań klientów i pomoc techniczna', 'online', 'GPT-4o', 1247, 94.2, now()),
  ('Agent Sprzedażowy', 'Automatyzacja procesu sprzedaży i leadów', 'online', 'GPT-4o', 832, 87.5, now() - interval '2 minutes'),
  ('Analityk Danych', 'Analiza raportów i generowanie insightów', 'training', 'Claude 3.5', 156, 91.0, now() - interval '1 hour'),
  ('Bot HR', 'Odpowiedzi na pytania pracowników i onboarding', 'offline', 'GPT-4o-mini', 423, 96.1, now() - interval '1 day'),
  ('Moderator Treści', 'Automatyczna moderacja i filtrowanie treści', 'error', 'GPT-4o', 2103, 78.3, now() - interval '5 minutes');

-- Seed conversation stats (last 7 days)
INSERT INTO public.conversation_stats (agent_id, date, total_conversations, resolved_conversations)
SELECT a.id, d.date, 
  floor(random() * 100 + 20)::int,
  floor(random() * 80 + 15)::int
FROM public.agents a
CROSS JOIN generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day'::interval) d(date);

-- Seed usage categories
INSERT INTO public.usage_categories (name, percentage, color) VALUES
  ('Obsługa klienta', 42, 'hsl(175, 80%, 50%)'),
  ('Sprzedaż', 28, 'hsl(145, 65%, 45%)'),
  ('HR', 15, 'hsl(38, 90%, 55%)'),
  ('Analityka', 10, 'hsl(260, 60%, 55%)'),
  ('Moderacja', 5, 'hsl(0, 70%, 55%)');

-- Seed activity logs
INSERT INTO public.activity_logs (agent_id, event_type, description, created_at)
SELECT a.id,
  (ARRAY['conversation', 'error', 'training', 'deployment'])[floor(random()*4+1)],
  (ARRAY['Zakończono rozmowę z klientem', 'Wykryto błąd w odpowiedzi', 'Rozpoczęto trening modelu', 'Wdrożono nową wersję'])[floor(random()*4+1)],
  now() - (random() * interval '24 hours')
FROM public.agents a
CROSS JOIN generate_series(1, 3);
