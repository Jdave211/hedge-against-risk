import { useState, useEffect, useCallback } from 'react';
import { searchEvents } from "@/lib/api";   
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message, HedgeAPIResponse } from '@/types/chat';

// TODO: Connect to your FastAPI backend
const FASTAPI_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

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

async function sendToHedgeAPI(query: string): Promise<HedgeAPIResponse> {
  const data: any = await searchEvents(query);

  // Backend returns: { query, results: [...] }
  // But older shapes might be an array or { events: [...] }
  const rawResults = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.events)
        ? data.events
        : [];

  const results = (await enrichResultsWithSeriesTicker(rawResults)) as HedgeAPIResponse['results'];

  return { query, results };
}

export function useChatLogic(userId: string | undefined) {
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
        const allResults = mapped.flatMap((m) => m.response_data?.results ?? []);
        const enrichedResults = await enrichResultsWithSeriesTicker(allResults as any[]);
        const byEventId = new Map(enrichedResults.map((r: any) => [r.event_id, r] as const));

        const enrichedMessages = mapped.map((m) => {
          if (!m.response_data?.results?.length) return m;
          return {
            ...m,
            response_data: {
              ...m.response_data,
              results: m.response_data.results.map((r: any) => byEventId.get(r.event_id) ?? r),
            },
          };
        });

        setMessages(enrichedMessages);
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

      // Create conversation if none exists
      if (!conversationId) {
        conversationId = await createConversation(content);
        if (!conversationId) return;
      }

      setLoading(true);

      // Add user message optimistically
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Save user message to DB
      const { data: savedUserMsg } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: conversationId as string,
          role: 'user' as const,
          content,
        }])
        .select()
        .single();

      if (savedUserMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? { ...m, id: savedUserMsg.id } : m))
        );
      }

      // Call FastAPI backend
      try {
        const apiResponse = await sendToHedgeAPI(content);

        // Generate assistant response
        const assistantContent =
          apiResponse.results.length > 0
            ? `I found ${apiResponse.results.length} hedging opportunities related to "${content}". Here are the markets that might help protect your business:`
            : `I searched for hedging opportunities related to "${content}" but didn't find any matching markets. Try being more specific about the risk you want to hedge against, or explore different categories.`;

        const assistantMessage: Message = {
          id: `temp-assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          response_data: apiResponse,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message to DB
        const { data: savedAssistantMsg } = await supabase
          .from('chat_messages')
          .insert([{
            conversation_id: conversationId as string,
            role: 'assistant' as const,
            content: assistantContent,
            response_data: JSON.parse(JSON.stringify(apiResponse)),
          }])
          .select()
          .single();

        if (savedAssistantMsg) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, id: savedAssistantMsg.id } : m
            )
          );
        }

        // Update conversation title if it's the first message
        if (conversations.find((c) => c.id === conversationId)?.title === 'New Chat') {
          await supabase
            .from('conversations')
            .update({ title: content.slice(0, 50) + (content.length > 50 ? '...' : '') })
            .eq('id', conversationId);

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? { ...c, title: content.slice(0, 50) + (content.length > 50 ? '...' : '') }
                : c
            )
          );
        }
      } catch (error) {
        console.error('Error calling Hedge API:', error);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching for hedging opportunities. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }

      setLoading(false);
    },
    [userId, loading, activeConversationId, createConversation, conversations]
  );

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);

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
