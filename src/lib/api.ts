const API_URL = import.meta.env.VITE_API_URL;

export async function searchEvents(query: string) {
  const res = await fetch(`${API_URL}/v1/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ============ NEW CHAT API ENDPOINTS ============

export interface ChatMessagePayload {
  conversation_id?: string;
  message: string;
  user_id: string;
}

export interface ChatMessageResponse {
  conversation_id: string;
  message_id: string;
  response: string;
  markets?: any[] | null;
}

export async function sendChatMessage(payload: ChatMessagePayload): Promise<ChatMessageResponse> {
  const res = await fetch(`${API_URL}/v1/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat message failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function deleteChatConversation(conversationId: string, userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/chat/${conversationId}?user_id=${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete conversation failed (${res.status}): ${text}`);
  }
}

// ============ DOCUMENT ANALYSIS API ENDPOINTS ============

export interface DocumentAnalysisResponse {
  status: string;
  analysis: {
    income?: {
      amount: number | null;
      frequency: string | null;
    };
    expenses?: Record<string, number>;
    vulnerabilities?: string[];
    hedge_suggestions?: string[];
    summary?: string;
    analyzed_at: string;
  };
}

export async function analyzeDocument(userId: string, file: File): Promise<DocumentAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/v1/profile/${userId}/analyze-document`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Document analysis failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getFinancialAnalysis(userId: string): Promise<any> {
  const res = await fetch(`${API_URL}/v1/profile/${userId}/financial-analysis`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get financial analysis failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function deleteFinancialAnalysis(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/profile/${userId}/financial-analysis`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete financial analysis failed (${res.status}): ${text}`);
  }
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  recommendation_id: string | null;
  news_event_id: string | null;
  read_at: string | null;
  created_at: string;
}

export async function getNotifications(userId: string, unreadOnly = false, limit = 50): Promise<Notification[]> {
  const params = new URLSearchParams({ unread_only: String(unreadOnly), limit: String(limit) });
  const res = await fetch(`${API_URL}/v1/notifications/${userId}?${params}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  
  return res.json();
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/notifications/${notificationId}/read`, {
    method: "POST",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to mark notification as read: ${res.status}`);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/notifications/${userId}/read-all`, {
    method: "POST",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to mark all notifications as read: ${res.status}`);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const res = await fetch(`${API_URL}/v1/notifications/${userId}/unread-count`);
  
  if (!res.ok) {
    throw new Error(`Failed to get unread count: ${res.status}`);
  }
  
  const data = await res.json();
  return data.unread_count;
}

export type UserAction = 'clicked' | 'dismissed' | 'saved' | 'executed_elsewhere';

export async function logAction(
  userId: string,
  recommendationId: string,
  action: UserAction,
  meta: Record<string, unknown> = {}
): Promise<void> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { error } = await supabase.from('actions').insert({
    user_id: userId,
    recommendation_id: recommendationId,
    action: action as 'clicked' | 'dismissed' | 'saved' | 'executed_elsewhere',
    meta: meta as unknown as Record<string, never>,
  });
  
  if (error) {
    console.error('Failed to log action:', error);
    throw error;
  }
}
