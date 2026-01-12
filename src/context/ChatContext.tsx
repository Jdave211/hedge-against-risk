import { createContext, useContext, ReactNode } from 'react';
import { useChatLogic } from '@/hooks/useChatLogic';

const ChatContext = createContext<ReturnType<typeof useChatLogic> | null>(null);

export function ChatProvider({ children, userId }: { children: ReactNode; userId: string | undefined }) {
  const chatData = useChatLogic(userId);

  return (
    <ChatContext.Provider value={chatData}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

