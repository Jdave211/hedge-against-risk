import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Clock, CheckCircle, Loader2, ExternalLink, DollarSign, X, Undo2, TrendingDown, ShieldCheck } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { logAction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Recommendation {
  id: string;
  status: string;
  match_score: number;
  rationale: string;
  price_now: number | null;
  price_threshold: number | null;
  estimated_loss: number | null;
  estimated_recovery: number | null;
  created_at: string;
  event_id: string | null;
  market_id: string | null;
  outcome_id: string | null;
  rec_json: Json;
  markets?: { title: string; url: string | null; category: string | null } | null;
  kalshi_events?: { title: string; subtitle: string | null; series_ticker: string | null } | null;
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
  const [dismissedRecs, setDismissedRecs] = useState<Map<string, { rec: Recommendation; timeout: NodeJS.Timeout }>>(new Map());
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

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
        kalshi_events(title, subtitle, series_ticker)
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
            kalshi_events(title, subtitle, series_ticker)
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

  const handleDismiss = useCallback((rec: Recommendation) => {
    if (!user) return;
    
    // Remove from visible list
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
    
    // Set up undo timeout (5 seconds)
    const timeout = setTimeout(async () => {
      // Actually log the action after undo period
      try {
        await logAction(user.id, rec.id, 'dismissed');
      } catch (e) {
        console.error('Failed to log dismiss action:', e);
      }
      setDismissedRecs(prev => {
        const next = new Map(prev);
        next.delete(rec.id);
        return next;
      });
    }, 5000);
    
    setDismissedRecs(prev => new Map(prev).set(rec.id, { rec, timeout }));
    
    toast({
      title: "Recommendation dismissed",
      description: "You won't see this recommendation again.",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUndo(rec.id)}
          className="gap-1"
        >
          <Undo2 className="h-3 w-3" />
          Undo
        </Button>
      ),
    });
  }, [user, toast]);

  const handleUndo = useCallback((recId: string) => {
    const dismissed = dismissedRecs.get(recId);
    if (!dismissed) return;
    
    // Clear the timeout so action isn't logged
    clearTimeout(dismissed.timeout);
    
    // Add back to recommendations
    setRecommendations(prev => [dismissed.rec, ...prev].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
    
    setDismissedRecs(prev => {
      const next = new Map(prev);
      next.delete(recId);
      return next;
    });
    
    toast({ title: "Recommendation restored" });
  }, [dismissedRecs, toast]);

  const handleKalshiClick = useCallback(async (rec: Recommendation, url: string) => {
    if (!user) return;
    
    // Log the click action
    try {
      await logAction(user.id, rec.id, 'clicked', { url });
    } catch (e) {
      console.error('Failed to log click action:', e);
    }
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Obtaining potential hedging opportunities...</p>
      </div>
    );
  }

  const hedgeNow = recommendations.filter(r => r.status === 'hedge_now');
  const waiting = recommendations.filter(r => r.status === 'wait');
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "hedge_now" || tabParam === "watching" || tabParam === "all" ? tabParam : "all";

  const MotionTabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <TabsContent value={value} className="mt-0">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </TabsContent>
  );

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your hedging recommendations and active positions.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Recommendations</CardDescription>
              <CardTitle className="text-3xl">{recommendations.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Hedge Now</CardDescription>
              <CardTitle className="text-3xl text-primary">{hedgeNow.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Watching</CardDescription>
              <CardTitle className="text-3xl">{waiting.length}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Recommendations Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const next = new URLSearchParams(searchParams);
            next.set("tab", value);
            setSearchParams(next, { replace: true });
          }}
          className="space-y-6"
        >
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hedge_now">Hedge Now</TabsTrigger>
            <TabsTrigger value="watching">Watching</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === 'all' && (
              <MotionTabsContent key="all" value="all">
                <RecommendationsList 
                  recommendations={recommendations} 
                  onDismiss={handleDismiss}
                  onKalshiClick={handleKalshiClick}
                />
              </MotionTabsContent>
            )}

            {activeTab === 'hedge_now' && (
              <MotionTabsContent key="hedge_now" value="hedge_now">
                <RecommendationsList 
                  recommendations={hedgeNow} 
                  onDismiss={handleDismiss}
                  onKalshiClick={handleKalshiClick}
                />
              </MotionTabsContent>
            )}

            {activeTab === 'watching' && (
              <MotionTabsContent key="watching" value="watching">
                <RecommendationsList 
                  recommendations={waiting} 
                  onDismiss={handleDismiss}
                  onKalshiClick={handleKalshiClick}
                />
              </MotionTabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onDismiss: (rec: Recommendation) => void;
  onKalshiClick: (rec: Recommendation, url: string) => void;
}

function RecommendationsList({ recommendations, onDismiss, onKalshiClick }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No recommendations yet. Search for risks to get started!</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec, index) => {
        const marketTitle = rec.markets?.title;
        const eventTitle = rec.kalshi_events?.title;
        const category = rec.markets?.category;
        const seriesTicker = rec.kalshi_events?.series_ticker;
        const kalshiUrl = seriesTicker ? `https://kalshi.com/markets/${seriesTicker}` : null;

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="bg-card border-border shadow-sm hover:border-primary/50 transition-colors">
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

                    {/* Loss/Recovery info */}
                    {(rec.estimated_loss !== null || rec.estimated_recovery !== null) && (
                      <div className="flex items-center gap-4 text-sm">
                        {rec.estimated_loss !== null && (
                          <div className="flex items-center gap-1 text-destructive">
                            <TrendingDown className="h-4 w-4" />
                            <span>Est. Loss: <strong>${rec.estimated_loss.toLocaleString()}</strong></span>
                          </div>
                        )}
                        {rec.estimated_recovery !== null && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Est. Recovery: <strong>${rec.estimated_recovery.toLocaleString()}</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price info and actions */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
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
                        {kalshiUrl && (
                          <button
                            onClick={() => onKalshiClick(rec, kalshiUrl)}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View on Kalshi <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismiss(rec)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Not interested
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
