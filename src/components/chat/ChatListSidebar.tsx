import { useMemo, useState } from "react";
import { Plus, MessageSquare, MoreHorizontal, Search, Trash2, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatListSidebar() {
  const { conversations, activeConversationId, setActiveConversationId, startNewChat, deleteConversation } = useChat();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => (c.title || "New Chat").toLowerCase().includes(q));
  }, [conversations, query]);

  const visibleConversations = useMemo(() => {
    if (showAll) return filteredConversations;
    return filteredConversations.slice(0, 8);
  }, [filteredConversations, showAll]);

  // Reset pagination when the filter changes
  // (so a new search doesn't land in a half-expanded state)
  if (showAll && query.trim().length > 0 && filteredConversations.length <= 8) {
    // no-op: leaving open is fine when results are short
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b-2 border-border">
        <Button 
          onClick={() => startNewChat()} 
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">New Chat</span>
        </Button>

        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="pl-9 pr-9 h-9 bg-muted/30"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Chats</h2>
        </div>
        <ScrollArea className="h-[calc(100%-3rem)]">
          <div className="px-2 pb-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {conversations.length === 0 ? "No chats yet" : "No matches"}
                </p>
              </div>
            ) : (
              <>
                {visibleConversations.map((chat) => (
                  <div key={chat.id} className="group relative">
                    <button
                      onClick={() => setActiveConversationId(chat.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left",
                        activeConversationId === chat.id
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          activeConversationId === chat.id ? "text-primary" : "text-muted-foreground/70"
                        )}
                      />
                      <span className="truncate flex-1">{chat.title || "New Chat"}</span>
                    </button>

                    {/* Context Menu for Chat Item */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(chat.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {filteredConversations.length > 8 && (
                  <div className="px-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowAll((v) => !v)}
                    >
                      {showAll
                        ? "See less"
                        : `See more (${filteredConversations.length - 8} more)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

