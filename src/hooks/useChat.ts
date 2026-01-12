import { useChatContext } from '@/context/ChatContext';

// We ignore the userId argument if passed, as it is now handled by the provider
export const useChat = (userId?: string) => {
  return useChatContext();
};

