import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage, deleteChatConversation } from "@/lib/api";   
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message, HedgeAPIResponse } from '@/types/chat';

async function enrichResultsWithSeriesTicker(results: any[]): Promise<any[]> {
  const missingEventIds = Array.from(
    new Set(
      results
        .filter((r: any) => r?.event_id && !r?.series_ticker)
        .map((r: any) => r.event_id as string)
    )
  );

  if (missingEventIds.length === 0) return results;

  const { data: events, error } = await supabase
    .from('kalshi_events')
    .select('id, series_ticker')
    .in('id', missingEventIds);

  if (error || !events) return results;

  const tickerMap = new Map(events.map((e) => [e.id, e.series_ticker] as const));

  return results.map((r: any) => ({
    ...r,
    series_ticker: r.series_ticker ?? tickerMap.get(r.event_id ?? '') ?? null,
  }));
}

export function useChat(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    if (!userId) return;

    async function loadConversations() {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
      setConversationsLoading(false);
    }

    loadConversations();
  }, [userId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const mapped: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          response_data: msg.response_data as unknown as HedgeAPIResponse | null,
        }));

        // Ensure old conversations also get a Kalshi link (by enriching stored results)
        // Support both old format (results) and new format (markets)
        const allResults = mapped.flatMap((m) => {
          const markets = m.response_data?.markets || m.response_data?.results || [];
          return markets;
        });
        
        if (allResults.length > 0) {
          const enrichedResults = await enrichResultsWithSeriesTicker(allResults as any[]);
          const byEventId = new Map(enrichedResults.map((r: any) => [r.event_id, r] as const));

          const enrichedMessages = mapped.map((m) => {
            const markets = m.response_data?.markets || m.response_data?.results;
            if (!markets?.length) return m;
            
            const enrichedMarkets = markets.map((r: any) => byEventId.get(r.event_id) ?? r);
            
            return {
              ...m,
              response_data: {
                ...m.response_data,
                markets: enrichedMarkets,
                results: enrichedMarkets,
              },
            };
          });

          setMessages(enrichedMessages);
        } else {
          setMessages(mapped);
        }
      }
    }

    loadMessages();
  }, [activeConversationId]);

  const createConversation = useCallback(
    async (initialMessage?: string) => {
      if (!userId) return null;

      const title = initialMessage
        ? initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : '')
        : 'New Chat';

      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (!error && data) {
        setConversations((prev) => [data, ...prev]);
        setActiveConversationId(data.id);
        return data.id;
      }
      return null;
    },
    [userId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || loading) return;

      let conversationId = activeConversationId;

      setLoading(true);

      // Add user message optimistically (for immediate UI feedback)
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content,
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      try {
        // Call new backend API - it handles saving both user and assistant messages
        const apiResponse = await sendChatMessage({
          conversation_id: conversationId || undefined,
          message: content,
          user_id: userId,
        });

        // Update conversation ID if this was a new conversation
        const newConversationId = apiResponse.conversation_id;
        if (!conversationId) {
          conversationId = newConversationId;
          setActiveConversationId(newConversationId);
          
          // Reload conversations list to include the new one
          const { data: newConv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', newConversationId)
            .single();
          
          if (newConv) {
            setConversations((prev) => [newConv, ...prev]);
          }
        }

        // Fetch the latest messages from the conversation to get both user and assistant messages
        // with proper IDs from the database
        const { data: latestMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', newConversationId)
          .order('created_at', { ascending: true });

        if (!error && latestMessages) {
          // Map to Message type and enrich with series tickers
          const mapped: Message[] = latestMessages.map((msg) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            response_data: msg.response_data as unknown as HedgeAPIResponse | null,
          }));

          // Enrich market results with series_ticker
          const allResults = mapped.flatMap((m) => {
            const markets = m.response_data?.markets || m.response_data?.results || [];
            return markets;
          });
          
          if (allResults.length > 0) {
            const enrichedResults = await enrichResultsWithSeriesTicker(allResults as any[]);
            const byEventId = new Map(enrichedResults.map((r: any) => [r.event_id, r] as const));

            const enrichedMessages = mapped.map((m) => {
              const markets = m.response_data?.markets || m.response_data?.results;
              if (!markets?.length) return m;
              
              const enrichedMarkets = markets.map((r: any) => byEventId.get(r.event_id) ?? r);
              
              return {
                ...m,
                response_data: {
                  ...m.response_data,
                  markets: enrichedMarkets,
                  results: enrichedMarkets,
                },
              };
            });

            setMessages(enrichedMessages);
          } else {
            setMessages(mapped);
          }
        }

        // Update conversation title in the list
        const { data: updatedConv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', newConversationId)
          .single();

        if (updatedConv) {
          setConversations((prev) =>
            prev.map((c) => (c.id === newConversationId ? updatedConv : c))
          );
        }
      } catch (error) {
        console.error('Error calling chat API:', error);
        
        // Remove the optimistic user message and show error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your message. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      setLoading(false);
    },
    [userId, loading, activeConversationId, conversations]
  );

  const deleteConversation = useCallback(async (id: string) => {
    if (!userId) return;
    
    try {
      await deleteChatConversation(id, userId);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [activeConversationId, userId]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    loading,
    conversationsLoading,
    setActiveConversationId,
    sendMessage,
    deleteConversation,
    startNewChat,
  };
}
