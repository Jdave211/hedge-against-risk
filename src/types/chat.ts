export interface MarketOutcome {
  label: string;
  outcome_id: string;
  latest_price: {
    ts: string;
    ask: number;
    bid: number;
    price: number;
    liquidity: number;
    outcome_id: string;
  } | null;
}

export interface Market {
  market_id: string;
  market_title: string;
  external_market_id: string;
  outcomes: MarketOutcome[];
}

export interface SearchResult {
  event_id: string;
  event_title: string;
  series_ticker?: string;
  similarity: number;
  markets: Market[];
}

export interface HedgeAPIResponse {
  query?: string;
  results?: SearchResult[];
  markets?: SearchResult[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response_data?: HedgeAPIResponse | null;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}
