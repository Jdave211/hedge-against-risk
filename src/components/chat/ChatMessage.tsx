import { Bot, User } from 'lucide-react';
import { MarketResultCard } from './MarketResultCard';
import type { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary' : 'bg-muted'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className={`max-w-[80%] space-y-3 ${isUser ? 'items-end' : ''}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.response_data?.results && message.response_data.results.length > 0 && (
          <div className="space-y-2">
            {message.response_data.results.map((result) => (
              <MarketResultCard key={result.event_id} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
