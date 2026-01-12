import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Clock, CheckCircle, Loader2, ExternalLink, DollarSign, X, Undo2, TrendingDown, ShieldCheck, FileText, Upload, AlertTriangle, Target } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
import { logAction, getFinancialAnalysis } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from '@/components/onboarding/FileUpload';

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
  const [financialAnalysis, setFinancialAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');
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
      fetchFinancialAnalysis();
    }
  }, [user, authLoading, navigate]);

  const fetchFinancialAnalysis = async () => {
    if (!user) return;
    
    setAnalysisLoading(true);
    try {
      const result = await getFinancialAnalysis(user.id);
      if (result.status === 'found') {
        setFinancialAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error fetching financial analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

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

        {/* Main Tabs: Recommendations and Exposure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="recommendations" className="gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="exposure" className="gap-2">
              <FileText className="h-4 w-4" />
              Exposure
            </TabsTrigger>
          </TabsList>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* Stats Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid sm:grid-cols-3 gap-4"
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

            {/* Sub-tabs for recommendations */}
            <Tabs 
              value={searchParams.get("tab") || "all"}
              onValueChange={(value) => {
                const next = new URLSearchParams(searchParams);
                next.set("tab", value);
                setSearchParams(next, { replace: true });
              }}
              className="space-y-4"
            >
              <TabsList className="bg-muted p-1">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="hedge_now">Hedge Now</TabsTrigger>
                <TabsTrigger value="watching">Watching</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {(searchParams.get("tab") || "all") === 'all' && (
                  <MotionTabsContent key="all" value="all">
                    <RecommendationsList 
                      recommendations={recommendations} 
                      onDismiss={handleDismiss}
                      onKalshiClick={handleKalshiClick}
                    />
                  </MotionTabsContent>
                )}

                {searchParams.get("tab") === 'hedge_now' && (
                  <MotionTabsContent key="hedge_now" value="hedge_now">
                    <RecommendationsList 
                      recommendations={hedgeNow} 
                      onDismiss={handleDismiss}
                      onKalshiClick={handleKalshiClick}
                    />
                  </MotionTabsContent>
                )}

                {searchParams.get("tab") === 'watching' && (
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
          </TabsContent>

          {/* EXPOSURE TAB */}
          <TabsContent value="exposure">
            <ExposureSection 
              user={user}
              financialAnalysis={financialAnalysis}
              analysisLoading={analysisLoading}
              onAnalysisUpdate={fetchFinancialAnalysis}
            />
          </TabsContent>
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

// ============ EXPOSURE SECTION ============

interface ExposureSectionProps {
  user: any;
  financialAnalysis: any;
  analysisLoading: boolean;
  onAnalysisUpdate: () => void;
}

function ExposureSection({ user, financialAnalysis, analysisLoading, onAnalysisUpdate }: ExposureSectionProps) {
  const [showUpload, setShowUpload] = useState(false);

  if (analysisLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading exposure analysis...</p>
      </motion.div>
    );
  }

  if (!financialAnalysis) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="py-12">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No Financial Analysis Yet</h3>
                <p className="text-muted-foreground">
                  Upload a financial document (bank statement, earnings report) to get AI-powered insights 
                  into your exposures, vulnerabilities, and personalized hedge recommendations.
                </p>
              </div>
              <div className="max-w-lg mx-auto">
                <FileUpload
                  userId={user.id}
                  documentType="bank-statement"
                  onAnalysisComplete={() => {
                    onAnalysisUpdate();
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const { extracted_data, risk_analysis, document_name, analyzed_at } = financialAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with document info */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {document_name || 'Financial Document'}
              </CardTitle>
              <CardDescription className="mt-1">
                Analyzed on {new Date(analyzed_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Upload className="h-4 w-4" />
              {showUpload ? 'Cancel' : 'Upload New Document'}
            </Button>
          </div>
        </CardHeader>
        {showUpload && (
          <CardContent className="border-t">
            <div className="pt-6">
              <FileUpload
                userId={user.id}
                documentType="bank-statement"
                onAnalysisComplete={() => {
                  onAnalysisUpdate();
                  setShowUpload(false);
                }}
              />
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Note: Uploading a new document will replace the current analysis. 
                Support for multiple documents coming soon.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Analysis Summary */}
      {risk_analysis?.summary && (
        <Card className="bg-card border-border shadow-sm border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Risk Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{risk_analysis.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Income Section */}
        {extracted_data?.income && (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  ${extracted_data.income.amount?.toLocaleString() || 'N/A'}
                </span>
                {extracted_data.income.frequency && (
                  <span className="text-muted-foreground">/ {extracted_data.income.frequency}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Expenses */}
        {extracted_data?.total_expenses && (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${extracted_data.total_expenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Expense Breakdown */}
      {extracted_data?.expenses && Object.keys(extracted_data.expenses).length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(extracted_data.expenses)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm font-medium capitalize">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-lg font-semibold">
                      ${(amount as number).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vulnerabilities */}
      {risk_analysis?.vulnerabilities && risk_analysis.vulnerabilities.length > 0 && (
        <Card className="bg-card border-border shadow-sm border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Financial Vulnerabilities
            </CardTitle>
            <CardDescription>
              Areas where you're exposed to risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {risk_analysis.vulnerabilities.map((vuln: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span className="text-sm text-muted-foreground">{vuln}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* High Risk Categories */}
      {risk_analysis?.high_risk_categories && Object.keys(risk_analysis.high_risk_categories).length > 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">High Risk Categories</CardTitle>
            <CardDescription>
              Expenses with high volatility or exposure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(risk_analysis.high_risk_categories).map(([category, data]: [string, any]) => (
                <div key={category} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium capitalize">{category.replace(/_/g, ' ')}</h4>
                    <Badge variant={data.risk_level === 'high' ? 'destructive' : data.risk_level === 'medium' ? 'default' : 'secondary'}>
                      {data.risk_level}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-semibold">${data.monthly_amount?.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{data.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hedge Suggestions */}
      {risk_analysis?.hedge_suggestions && risk_analysis.hedge_suggestions.length > 0 && (
        <Card className="bg-card border-border shadow-sm border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Recommended Hedges
            </CardTitle>
            <CardDescription>
              Markets and strategies to protect against these risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {risk_analysis.hedge_suggestions.map((suggestion: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
