import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '@/types/chat';

interface MarketResultCardProps {
  result: SearchResult;
}

export function MarketResultCard({ result }: MarketResultCardProps) {
  // Construct Kalshi URL from series_ticker (same as recommendations page)
  const kalshiUrl = result.series_ticker
    ? `https://kalshi.com/markets/${result.series_ticker}`
    : null;

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">{result.event_title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {(result.similarity * 100).toFixed(0)}% match
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.markets.map((market) => (
          <div key={market.market_id} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{market.market_title}</p>
            <div className="grid grid-cols-2 gap-2">
              {market.outcomes.map((outcome) => (
                <div
                  key={outcome.outcome_id}
                  className="flex items-center justify-between bg-background rounded-md px-2 py-1.5 text-xs"
                >
                  <span>{outcome.label}</span>
                  {outcome.latest_price && (
                    <span className="font-mono font-medium">
                      {(outcome.latest_price.price * 100).toFixed(0)}¢
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {kalshiUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            asChild
          >
            <a href={kalshiUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1.5" />
              View on Kalshi
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
