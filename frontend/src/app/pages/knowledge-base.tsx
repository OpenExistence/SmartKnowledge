import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Send, Sparkles, FileText, ExternalLink, Settings, Loader2, X } from "lucide-react";
import { api } from "../services/api";

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  sources?: { expert: string; domaine: string; date: string; excerpt: string }[];
}

interface Source {
  expert: string;
  domaine: string;
  date: string;
  excerpt: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'assistant',
    content: "Hello! I'm your AI knowledge assistant. I can help you find information from all indexed interviews. What would you like to know?",
  },
];

export function KnowledgeBase() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState("tinyllama");
  const [selectedModel, setSelectedModel] = useState("tinyllama");
  const [selectedDomaine, setSelectedDomaine] = useState("");
  const [selectedSensibilite, setSelectedSensibilite] = useState("tres_secret");
  const [entretiens, setEntretiens] = useState<{ id: number; expert_nom: string; domaine?: string }[]>([]);

  useEffect(() => {
    loadModels();
    loadEntretiens();
  }, []);

  const loadModels = async () => {
    try {
      const models = await api.getAvailableModels();
      setAvailableModels(models.available_models);
      setDefaultModel(models.default_model);
      setSelectedModel(models.default_model);
    } catch (err) {
      console.error("Failed to load models:", err);
      // Fallback models
      setAvailableModels(["tinyllama", "llama2", "mistral"]);
    }
  };

  const loadEntretiens = async () => {
    try {
      const data = await api.getEntretiens();
      setEntretiens(data.filter(e => e.statut === "vectorisé" || e.statut === "transcrit"));
    } catch (err) {
      console.error("Failed to load entretiens:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
    };

    setMessages([...messages, userMessage]);
    const question = input;
    setInput("");
    setIsTyping(true);

    try {
      const result = await api.queryKnowledgeBase(
        question,
        selectedModel,
        selectedDomaine || undefined,
        selectedSensibilite
      );

      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: result.answer,
        sources: result.sources?.map((s: any) => ({
          expert: s.expert,
          domaine: s.domaine,
          date: s.date,
          excerpt: s.excerpt,
        })),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: "Sorry, I encountered an error while processing your question. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const domaines = [...new Set(entretiens.map(e => e.domaine).filter(Boolean))];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Knowledge Base</h1>
            <p className="text-muted-foreground">Ask questions and get answers from your expert interviews</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Query Settings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">LLM Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Domain Filter</label>
                  <select
                    value={selectedDomaine}
                    onChange={(e) => setSelectedDomaine(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Domains</option>
                    {domaines.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Sensitivity</label>
                  <select
                    value={selectedSensibilite}
                    onChange={(e) => setSelectedSensibilite(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="public">Public</option>
                    <option value="interne">Internal</option>
                    <option value="confidentiel">Confidential</option>
                    <option value="secret">Secret</option>
                    <option value="tres_secret">Top Secret</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Current model: <span className="font-medium">{selectedModel}</span>
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-xl p-4 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium mb-2 opacity-70">Sources:</p>
                      <div className="space-y-2">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="text-xs opacity-80 p-2 bg-background/50 rounded">
                            <div className="flex items-center gap-1 font-medium">
                              <FileText className="w-3 h-3" />
                              {source.expert} - {source.domaine}
                            </div>
                            <p className="mt-1 line-clamp-2">{source.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 font-medium text-sm">
                    U
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-accent rounded-xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your knowledge base..."
                className="flex-1 px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isTyping}
              />
              <Button type="submit" disabled={!input.trim() || isTyping}>
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Using model: <span className="font-medium">{selectedModel}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "What are the best practices for cloud migration?",
              "How do we handle microservices deployment?",
              "What tools does the DevOps team use?",
              "Tell me about our design system",
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm"
                disabled={isTyping}
              >
                {question}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indexed Interviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entretiens.length === 0 ? (
              <p className="text-sm text-muted-foreground">No indexed interviews yet</p>
            ) : (
              entretiens.slice(0, 5).map((interview, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{interview.expert_nom}</p>
                      <p className="text-xs text-muted-foreground">{interview.domaine}</p>
                    </div>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}