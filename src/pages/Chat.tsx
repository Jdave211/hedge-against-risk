import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { Send, Loader2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialQueryProcessed = useRef(false);

  const {
    conversations,
    activeConversationId,
    messages,
    loading,
    conversationsLoading,
    setActiveConversationId,
    sendMessage,
    deleteConversation,
    startNewChat,
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
      // Clear the URL param
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
      <Layout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-20 left-4 z-50 md:hidden bg-background shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <div
          className={cn(
            'fixed md:relative z-40 h-[calc(100vh-4rem)] bg-background transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              setSidebarOpen(false);
            }}
            onNewChat={() => {
              startNewChat();
              setSidebarOpen(false);
            }}
            onDeleteConversation={deleteConversation}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b">
            <h1 className="text-lg font-semibold">Hedge AI</h1>
            <p className="text-sm text-muted-foreground">Find hedging opportunities for your risks</p>
          </div>

          <Card className="flex-1 m-4 overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg font-medium mb-2">Welcome to Hedge AI</p>
                      <p className="text-sm">Ask about risks you want to protect against</p>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Searching for hedging opportunities...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about risks to hedge..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
