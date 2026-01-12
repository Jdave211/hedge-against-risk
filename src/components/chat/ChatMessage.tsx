import { useCallback } from 'react';
import { Bookmark, ChevronDown, Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { MarketResultCard } from './MarketResultCard';
import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch {
      // Ignore (non-secure context or permissions); still keeps UI stable.
    }
  }, [message.content]);

  return (
    <div className={cn("w-full", isUser ? "flex justify-end" : "flex justify-start")}>
      {isUser ? (
        <div className="max-w-[70%] rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      ) : (
        <div className="w-full max-w-[48rem] space-y-3">
          {/* Meta row (ChatGPT-style) */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Thought for a few seconds</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>

          {/* Assistant content */}
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Market cards (keep existing) */}
          {message.response_data?.results && message.response_data.results.length > 0 && (
            <div className="space-y-2 pt-1">
              {message.response_data.results.map((result) => (
                <MarketResultCard key={result.event_id} result={result} />
              ))}
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-1 pt-1 text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} aria-label="Copy">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Save">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Thumbs up">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Thumbs down">
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Regenerate">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
