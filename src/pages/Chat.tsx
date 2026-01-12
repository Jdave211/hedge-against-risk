import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { Send, Loader2, ArrowUp, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQueryProcessed = useRef(false);

  const {
    messages,
    loading,
    conversationsLoading,
    sendMessage,
  } = useChat(user?.id);

  // Handle query from URL params
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const query = searchParams.get('q');
    if (query && user && !conversationsLoading && !initialQueryProcessed.current) {
      initialQueryProcessed.current = true;
      sendMessage(query);
      navigate('/chat', { replace: true });
    }
  }, [user, authLoading, searchParams, navigate, conversationsLoading, sendMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
  };

  if (authLoading || conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="h-full w-full bg-background flex flex-col min-w-0 relative">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto w-full px-4 py-10">
            {isEmpty ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 mt-20">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-medium tracking-tight">Start a new chat</h1>
                <p className="text-muted-foreground text-sm max-w-md">
                  Ask Hedge AI about market risks, hedging strategies, or specific assets you want to protect.
                </p>
              </div>
            ) : (
              <div className="space-y-10 pb-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {loading && (
                  <div className="flex gap-4 p-4 rounded-xl bg-muted/30 max-w-[85%]">
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center shadow-sm shrink-0">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground animate-pulse">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        {isEmpty ? (
          /* Keep the new-chat page feel the same */
          <div className="p-4 w-full max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-muted/30 backdrop-blur-xl border shadow-sm rounded-2xl p-2 flex items-center gap-2 focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/20 transition-all">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                  className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto text-base placeholder:text-muted-foreground/50"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-muted-foreground/60">
                  AI can make mistakes. Check important info.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation input (ChatGPT-style, centered) */
          <div className="w-full border-t border-border/60 bg-background/60 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto w-full px-4 py-4">
              <div className="rounded-2xl border border-border bg-card shadow-sm px-3 py-2 flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Probable…"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                  className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-3 h-auto text-base placeholder:text-muted-foreground/60"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
                  aria-label="Send"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-muted-foreground/60">
                  AI can make mistakes. Check important info.
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
