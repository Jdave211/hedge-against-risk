import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  large?: boolean;
  placeholder?: string;
}

export function SearchBar({ large = false, placeholder = "Ask Hedge AI anything..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (large) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-focus-within:bg-primary/30 transition-all duration-300" />
          <div className="relative flex items-center glass rounded-xl p-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 ml-4"
            />
            <Button type="submit" size="lg" className="rounded-lg gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <Button type="submit" size="icon" variant="ghost" className="absolute right-1 h-7 w-7">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
