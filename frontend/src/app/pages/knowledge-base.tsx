import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Send, Sparkles, FileText, ExternalLink } from "lucide-react";

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  sources?: { title: string; expert: string }[];
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: `Based on the interviews in our knowledge base, here's what I found:\n\nFor cloud architecture best practices, Sarah Johnson recommends implementing a blue-green deployment strategy with feature flags. This allows for gradual traffic shifting while monitoring performance metrics in real-time.\n\nKey points:\n1. Invest heavily in observability from day one\n2. Automate everything - tests, deployments, rollbacks\n3. Use connection pooling at the application level\n4. Communicate constantly with stakeholders\n\nWould you like me to provide more details on any of these points?`,
        sources: [
          { title: "Senior Engineer - Cloud Architecture", expert: "Sarah Johnson" },
          { title: "DevOps Lead - Infrastructure", expert: "David Kim" },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">Ask questions and get answers from your expert interviews</p>
        </div>

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
                  {message.sources && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium mb-2 opacity-70">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="text-xs flex items-center gap-1 opacity-80">
                            <FileText className="w-3 h-3" />
                            <span>{source.title} - {source.expert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 font-medium text-sm">
                    JD
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
              />
              <Button type="submit" disabled={!input.trim() || isTyping}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses are generated from indexed interview transcripts
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
              >
                {question}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Interviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Senior Engineer - Cloud Architecture", expert: "Sarah Johnson" },
              { title: "DevOps Lead - Infrastructure", expert: "David Kim" },
              { title: "Backend Engineer - Microservices", expert: "Robert Taylor" },
            ].map((interview, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-border hover:bg-accent transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{interview.title}</p>
                    <p className="text-xs text-muted-foreground">{interview.expert}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
