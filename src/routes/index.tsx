import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageCircle,
  Copy,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  AlertTriangle,
  CheckSquare,
  CalendarDays,
  Users,
  StickyNote,
  Sun,
  Moon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  generateEmail,
  summarizeMeeting,
  planTasks,
  researchTopic,
} from "@/lib/ai.functions";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskFlow AI — Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Compose emails, summarize meetings, plan tasks, run research, and chat with an AI workplace assistant.",
      },
    ],
  }),
  component: Home,
});

type ToolKey =
  | "email"
  | "meeting"
  | "tasks"
  | "research"
  | "chat"
  | "mytasks"
  | "calendar"
  | "team"
  | "notes";

const TOOLS: { key: ToolKey; label: string; icon: React.ComponentType<{ className?: string }>; group: "ai" | "work" | "interactive" }[] = [
  { key: "email", label: "Smart Email Gen", icon: Mail, group: "ai" },
  { key: "meeting", label: "Meeting Summarizer", icon: FileText, group: "ai" },
  { key: "tasks", label: "AI Task Planner", icon: ListChecks, group: "ai" },
  { key: "research", label: "Research Assistant", icon: Search, group: "ai" },
  { key: "mytasks", label: "My Tasks", icon: CheckSquare, group: "work" },
  { key: "calendar", label: "Calendar & Blocks", icon: CalendarDays, group: "work" },
  { key: "team", label: "Team Space", icon: Users, group: "work" },
  { key: "notes", label: "Sticky Notes", icon: StickyNote, group: "work" },
  { key: "chat", label: "Assistant Chatbot", icon: MessageCircle, group: "interactive" },
];

function Home() {
  const [active, setActive] = useState<ToolKey>("mytasks");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  const aiTools = TOOLS.filter((t) => t.group === "ai");
  const workTools = TOOLS.filter((t) => t.group === "work");
  const interactive = TOOLS.filter((t) => t.group === "interactive");

  return (
    <div className="min-h-screen flex text-foreground">
      <Toaster theme={theme} position="top-right" />
      {/* Sidebar */}
      <aside className="w-64 shrink-0 glass border-r border-border p-5 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">TaskFlow AI</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Workplace Suite v1.0
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto -mr-2 pr-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2">
            AI Tools
          </p>
          {aiTools.map((t) => (
            <NavItem key={t.key} tool={t} active={active === t.key} onClick={() => setActive(t.key)} />
          ))}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-4">
            Workspace
          </p>
          {workTools.map((t) => (
            <NavItem key={t.key} tool={t} active={active === t.key} onClick={() => setActive(t.key)} />
          ))}
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-4">
            Interactive
          </p>
          {interactive.map((t) => (
            <NavItem key={t.key} tool={t} active={active === t.key} onClick={() => setActive(t.key)} />
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated/50 border border-border">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-cyan)]" />
          <span className="text-xs text-muted-foreground">Guardrails Active</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 glass border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {TOOLS.find((t) => t.key === active)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="w-9 h-9 rounded-lg border border-border bg-surface-elevated/50 hover:bg-surface-elevated flex items-center justify-center transition-colors"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-right">
              <p className="text-sm font-medium">Workspace User</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Professional Tier
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] flex items-center justify-center text-sm font-semibold text-primary-foreground">
              WU
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {(active === "email" || active === "meeting" || active === "tasks" || active === "research") && <Disclaimer />}
          <div className="mt-6">
            {active === "email" && <EmailTool />}
            {active === "meeting" && <MeetingTool />}
            {active === "tasks" && <TasksTool />}
            {active === "research" && <ResearchTool />}
            {active === "mytasks" && <MyTasksTool />}
            {active === "calendar" && <CalendarTool />}
            {active === "team" && <TeamSpaceTool />}
            {active === "notes" && <StickyNotesTool />}
            {active === "chat" && <ChatTool />}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  tool,
  active,
  onClick,
}: {
  tool: { key: ToolKey; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
        active
          ? "bg-primary/15 text-foreground border border-primary/30"
          : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/50 border border-transparent",
      )}
    >
      <Icon className="w-4 h-4" />
      {tool.label}
    </button>
  );
}

function Disclaimer() {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-surface/60 border border-border">
      <AlertTriangle className="w-5 h-5 text-[var(--accent-cyan)] shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold mb-1">Responsible AI Disclaimer</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Outputs are generated by artificial intelligence. While engineered for precision, models
          can hallucinate or produce omissions. Please review, edit, and verify all high-stakes
          communications, code, or strategic actions before implementation.
        </p>
      </div>
    </div>
  );
}

/* ---------- Shared UI primitives ---------- */

function Panel({ children, title, icon: Icon }: { children: React.ReactNode; title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[var(--accent-cyan)]" />
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">{children}</label>;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y min-h-[100px] font-mono",
        props.className,
      )}
    />
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
        props.className,
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer",
        props.className,
      )}
    />
  );
}

function PrimaryButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all",
        "bg-gradient-to-r from-[var(--accent-cyan)] to-primary text-primary-foreground",
        "hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20",
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {children}
    </button>
  );
}

function OutputBox({
  content,
  placeholder,
  loading,
}: {
  content: string;
  placeholder: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-violet)]" />
          Generated Output
        </h4>
        {content && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Copied to clipboard");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60 transition-colors"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {loading && !content ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
          </div>
        ) : content ? (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-code:text-[var(--accent-cyan)]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">{placeholder}</p>
        )}
      </div>
    </div>
  );
}

function useAiHandler<T>(fn: (input: T) => Promise<{ text: string }>) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async (input: T) => {
    setLoading(true);
    setOutput("");
    try {
      const res = await fn(input);
      setOutput(res.text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return { output, loading, run };
}

/* ---------- Tools ---------- */

function EmailTool() {
  const gen = useServerFn(generateEmail);
  const { output, loading, run } = useAiHandler((d: { intent: string; tone: "formal" | "friendly" | "persuasive"; sender: string }) =>
    gen({ data: d }),
  );
  const [intent, setIntent] = useState("");
  const [tone, setTone] = useState<"formal" | "friendly" | "persuasive">("formal");
  const [sender, setSender] = useState("");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Panel title="Generation Parameters" icon={Sparkles}>
        <div className="space-y-4">
          <div>
            <Label>Core Context / Intent</Label>
            <TextArea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Ask engineering team for a status update on Project Nova ahead of Friday's review..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tone</Label>
              <Select value={tone} onChange={(e) => setTone(e.target.value as never)}>
                <option value="formal">Formal & Professional</option>
                <option value="friendly">Friendly & Collaborative</option>
                <option value="persuasive">Persuasive & Strategic</option>
              </Select>
            </div>
            <div>
              <Label>Sender Signature</Label>
              <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Alex Chen" />
            </div>
          </div>
          <PrimaryButton loading={loading} onClick={() => intent && run({ intent, tone, sender })}>
            Compose AI Draft
          </PrimaryButton>
        </div>
      </Panel>
      <OutputBox
        content={output}
        loading={loading}
        placeholder="Set configurations and run generation."
      />
    </div>
  );
}

function MeetingTool() {
  const gen = useServerFn(summarizeMeeting);
  const { output, loading, run } = useAiHandler((d: { transcript: string }) => gen({ data: d }));
  const [transcript, setTranscript] = useState("");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Panel title="Meeting Transcript / Raw Notes" icon={FileText}>
        <TextArea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript or notes here..."
          className="min-h-[280px]"
        />
        <div className="mt-4">
          <PrimaryButton loading={loading} onClick={() => transcript && run({ transcript })}>
            Execute Analysis
          </PrimaryButton>
        </div>
      </Panel>
      <OutputBox
        content={output}
        loading={loading}
        placeholder="Provide meeting transcript for compilation."
      />
    </div>
  );
}

function TasksTool() {
  const gen = useServerFn(planTasks);
  const { output, loading, run } = useAiHandler((d: { backlog: string; horizon: "daily" | "weekly" }) =>
    gen({ data: d }),
  );
  const [backlog, setBacklog] = useState("");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("weekly");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Panel title="Task Backlog Injection" icon={ListChecks}>
        <div className="space-y-4">
          <div>
            <Label>Unstructured Backlog (one per line)</Label>
            <TextArea
              value={backlog}
              onChange={(e) => setBacklog(e.target.value)}
              placeholder={"Fix login bug\nDraft Q3 roadmap\nReview PR #482\nInterview two candidates"}
              className="min-h-[200px]"
            />
          </div>
          <div>
            <Label>Planning Horizon</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["daily", "weekly"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm border transition-colors",
                    horizon === h
                      ? "bg-primary/15 border-primary/40 text-foreground"
                      : "bg-input border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {h === "daily" ? "Daily Horizon" : "Weekly Engine Matrix"}
                </button>
              ))}
            </div>
          </div>
          <PrimaryButton loading={loading} onClick={() => backlog && run({ backlog, horizon })}>
            Formulate Prioritized Matrix
          </PrimaryButton>
        </div>
      </Panel>
      <OutputBox
        content={output}
        loading={loading}
        placeholder="Submit task queue to execute optimization engine."
      />
    </div>
  );
}

function ResearchTool() {
  const gen = useServerFn(researchTopic);
  const { output, loading, run } = useAiHandler((d: { topic: string; depth: "brief" | "deep" }) =>
    gen({ data: d }),
  );
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"brief" | "deep">("brief");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Panel title="Knowledge Request Portal" icon={Search}>
        <div className="space-y-4">
          <div>
            <Label>Target Topic / Documentation Core</Label>
            <TextArea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Competitive landscape for AI note-taking tools in 2026..."
            />
          </div>
          <div>
            <Label>Depth Framework</Label>
            <Select value={depth} onChange={(e) => setDepth(e.target.value as never)}>
              <option value="brief">High-Level Executive Brief</option>
              <option value="deep">Granular Deep Dive & Structural Analysis</option>
            </Select>
          </div>
          <PrimaryButton loading={loading} onClick={() => topic && run({ topic, depth })}>
            Synthesize Intel Report
          </PrimaryButton>
        </div>
      </Panel>
      <OutputBox
        content={output}
        loading={loading}
        placeholder="Awaiting research criteria profile inputs."
      />
    </div>
  );
}

function ChatTool() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (error) toast.error(error.message || "Chat error");
  }, [error]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="rounded-2xl bg-card border border-border flex flex-col h-[calc(100vh-16rem)] min-h-[500px] overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-sm text-foreground/90 leading-relaxed pt-1">
              Hello! I am your interactive workspace intelligence. I can help convert raw concepts,
              optimize workflow architectures, or answer contextual queries. How can I facilitate
              your productivity matrix today?
            </div>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-primary text-primary-foreground text-sm">
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="prose prose-invert prose-sm max-w-none flex-1 prose-p:my-2 prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-code:text-[var(--accent-cyan)]">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-violet)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
            </div>
            <div className="text-sm text-muted-foreground pt-1.5 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 bg-surface/40">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about your work..."
            rows={1}
            className="flex-1 px-3 py-2.5 rounded-lg bg-input border border-border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring resize-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
