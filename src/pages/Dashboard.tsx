import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckCircle, Loader2, ExternalLink, DollarSign } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface Recommendation {
  id: string;
  status: string;
  match_score: number;
  rationale: string;
  price_now: number | null;
  price_threshold: number | null;
  created_at: string;
  event_id: string | null;
  market_id: string | null;
  outcome_id: string | null;
  rec_json: Json;
  markets?: { title: string; url: string | null; category: string | null } | null;
  kalshi_events?: { title: string; subtitle: string | null } | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function runRecommendations(userId: string) {
  const res = await fetch(`${API_URL}/v1/recommendations/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, limit: 5 }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchRecommendations();
    }
  }, [user, authLoading, navigate]);

  const fetchRecommendations = async () => {
    if (!user) return;
  
    setLoading(true);
  
    // 1) Try DB first with joined data
    const { data, error } = await supabase
      .from("recommendations")
      .select(`
        *,
        markets(title, url, category),
        kalshi_events(title, subtitle)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
  
    if (error) {
      setLoading(false);
      return;
    }
  
    // 2) If none, run backend to generate + store, then refetch
    if (!data || data.length === 0) {
      try {
        await runRecommendations(user.id);
  
        const { data: data2 } = await supabase
          .from("recommendations")
          .select(`
            *,
            markets(title, url, category),
            kalshi_events(title, subtitle)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
  
        if (data2) setRecommendations(data2 as Recommendation[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }
  
    // 3) Otherwise use cached DB data
    setRecommendations(data as Recommendation[]);
    setLoading(false);
  };
  

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const hedgeNow = recommendations.filter(r => r.status === 'hedge_now');
  const waiting = recommendations.filter(r => r.status === 'wait');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your hedging recommendations and active positions.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription>Total Recommendations</CardDescription>
              <CardTitle className="text-3xl">{recommendations.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription>Hedge Now</CardDescription>
              <CardTitle className="text-3xl text-primary">{hedgeNow.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardDescription>Watching</CardDescription>
              <CardTitle className="text-3xl">{waiting.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recommendations Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hedge_now">Hedge Now</TabsTrigger>
            <TabsTrigger value="watching">Watching</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <RecommendationsList recommendations={recommendations} />
          </TabsContent>

          <TabsContent value="hedge_now">
            <RecommendationsList recommendations={hedgeNow} />
          </TabsContent>

          <TabsContent value="watching">
            <RecommendationsList recommendations={waiting} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function RecommendationsList({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No recommendations yet. Search for risks to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const marketTitle = rec.markets?.title;
        const eventTitle = rec.kalshi_events?.title;
        const category = rec.markets?.category;
        const marketUrl = rec.markets?.url;

        return (
          <Card key={rec.id} className="glass hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header with status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {rec.status === 'hedge_now' ? (
                      <Badge variant="default" className="bg-primary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Hedge Now
                      </Badge>
                    ) : rec.status === 'wait' ? (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Watching
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        No Action
                      </Badge>
                    )}
                    {category && (
                      <Badge variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    )}
                  </div>

                  {/* Market/Event Title */}
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">
                      {marketTitle || eventTitle || 'Unnamed Market'}
                    </h3>
                    {eventTitle && marketTitle && eventTitle !== marketTitle && (
                      <p className="text-sm text-muted-foreground mt-1">{eventTitle}</p>
                    )}
                  </div>

                  {/* Rationale */}
                  <p className="text-muted-foreground text-sm">
                    {rec.rationale || 'No rationale provided'}
                  </p>

                  {/* Price info */}
                  <div className="flex items-center gap-4 text-sm">
                    {rec.price_now !== null && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Current: <strong>{(rec.price_now * 100).toFixed(0)}¢</strong></span>
                      </div>
                    )}
                    {rec.price_threshold !== null && (
                      <div className="text-muted-foreground">
                        Target: {(rec.price_threshold * 100).toFixed(0)}¢
                      </div>
                    )}
                    {marketUrl && (
                      <a
                        href={marketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        View Market <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Match Score */}
                <div className="text-right shrink-0">
                  <p className="text-3xl font-bold text-primary">
                    {Math.round(rec.match_score * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Match</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
