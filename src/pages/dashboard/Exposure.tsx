import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileText, ExternalLink } from 'lucide-react';
import { getFinancialAnalysis } from '@/lib/api';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/onboarding/FileUpload';

export default function Exposure() {
  const { user, loading: authLoading } = useAuth();
  const [financialAnalyses, setFinancialAnalyses] = useState<any[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState("0");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchFinancialAnalysis();
    }
  }, [user, authLoading, navigate]);

  const fetchFinancialAnalysis = async () => {
    if (!user) return;
    
    setAnalysisLoading(true);
    try {
      const result = await getFinancialAnalysis(user.id);
      if (result.status === 'found' && result.analyses) {
        setFinancialAnalyses(result.analyses);
        if (result.analyses.length > 0) {
          setActiveTab("0");
        }
      }
    } catch (error) {
      console.error('Error fetching financial analysis:', error);
      // Ensure loading stops even on error
    } finally {
      // Add a small delay to ensure state updates properly
      setTimeout(() => setAnalysisLoading(false), 100);
    }
  };

  if (authLoading || analysisLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (financialAnalyses.length === 0) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-semibold tracking-tight">Financial Exposure</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Upload financial documents to analyze your exposures and vulnerabilities
            </p>
          </motion.div>

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
                      Upload up to 3 financial documents (bank statements, earnings reports) to get AI-powered insights 
                      into your exposures, vulnerabilities, and personalized hedge recommendations.
                    </p>
                  </div>
                  <div className="max-w-lg mx-auto">
                    <FileUpload
                      userId={user!.id}
                      documentType="bank-statement"
                      onAnalysisComplete={() => {
                        fetchFinancialAnalysis();
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Financial Exposure</h1>
              <p className="text-muted-foreground text-sm mt-1.5">
                AI-powered analysis of your financial vulnerabilities and hedge opportunities
              </p>
              <div className="mt-2">
                <Badge variant="secondary">{financialAnalyses.length} / 3 documents analyzed</Badge>
              </div>
            </div>
            {financialAnalyses.length < 3 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowUpload(!showUpload)}
              >
                <Upload className="h-4 w-4" />
                {showUpload ? 'Cancel' : 'Upload Document'}
              </Button>
            )}
          </div>
        </motion.div>

        {showUpload && financialAnalyses.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="pt-6">
                <FileUpload
                  userId={user!.id}
                  documentType="bank-statement"
                  onAnalysisComplete={() => {
                    fetchFinancialAnalysis();
                    setShowUpload(false);
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {financialAnalyses.length > 1 && (
            <TabsList>
              {financialAnalyses.map((analysis, idx) => (
                <TabsTrigger key={idx} value={idx.toString()}>
                  Document {idx + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {financialAnalyses.map((financialAnalysis, idx) => {
            const { extracted_data, risk_analysis, hedge_markets, document_name, analyzed_at } = financialAnalysis;

            return (
              <TabsContent key={idx} value={idx.toString()} className="space-y-6 mt-0">
                {/* Header with document info */}
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {document_name || `Financial Document ${idx + 1}`}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Analyzed on {new Date(analyzed_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Analysis Summary */}
                {risk_analysis?.summary && (
                  <Card className="bg-card border-border shadow-sm border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Profile Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{risk_analysis.summary}</p>
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

                  {/* Expenses Section */}
                  {extracted_data?.expenses && Object.keys(extracted_data.expenses).length > 0 && (
                    <Card className="bg-card border-border shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          Total Expenses
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {extracted_data.total_expenses && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">
                              ${extracted_data.total_expenses?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        )}
                        {extracted_data.expenses && (
                          <div className="pt-2 space-y-1.5 border-t">
                            {Object.entries(extracted_data.expenses)
                              .slice(0, 8)
                              .map(([category, amount]: [string, any]) => (
                                <div key={category} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground capitalize">
                                    {category.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="font-medium">${amount?.toLocaleString() || 'N/A'}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Vulnerabilities */}
                {risk_analysis?.vulnerabilities && Array.isArray(risk_analysis.vulnerabilities) && risk_analysis.vulnerabilities.length > 0 ? (
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Identified Vulnerabilities
                      </CardTitle>
                      <CardDescription>
                        Areas of financial risk that could benefit from hedging
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {risk_analysis.vulnerabilities.map((vuln: string, vulnIdx: number) => (
                          <div key={vulnIdx} className="border-l-2 border-yellow-500/30 pl-4 py-2 bg-yellow-500/5 rounded-r">
                            <p className="text-sm text-foreground">{vuln}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Hedge Markets - Prediction market-based hedging */}
                {hedge_markets && hedge_markets.length > 0 && (
                  <Card className="bg-card border-border shadow-sm border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Prediction Market Hedges
                      </CardTitle>
                      <CardDescription>
                        Markets based on your spending patterns - hedge your financial risks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {hedge_markets.map((market: any, idx: number) => (
                          <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-start gap-2 flex-wrap">
                                    {market.hedge_category && (
                                      <Badge variant="secondary" className="text-xs capitalize">
                                        {market.hedge_category}
                                      </Badge>
                                    )}
                                    {market.match && (
                                      <Badge variant="outline" className="text-xs">
                                        {market.match}% match
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm leading-tight">
                                    {market.marketTitle || market.market_title || market.title}
                                  </h4>
                                  <div className="flex items-center gap-4 text-xs">
                                    {market.yesPrice !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">YES</span>
                                        <span className="font-medium text-green-600">
                                          {Math.round(market.yesPrice * 100)}%
                                        </span>
                                      </div>
                                    )}
                                    {market.noPrice !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-muted-foreground">NO</span>
                                        <span className="font-medium text-red-600">
                                          {Math.round(market.noPrice * 100)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {(market.kalshiUrl || market.polymarketUrl) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 shrink-0"
                                    onClick={() => window.open(market.kalshiUrl || market.polymarketUrl, '_blank')}
                                  >
                                    <span>Trade</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Queries - Fallback if no markets found */}
                {risk_analysis?.market_queries && risk_analysis.market_queries.length > 0 && (!hedge_markets || hedge_markets.length === 0) && (
                  <Card className="bg-card border-border shadow-sm border-amber-500/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Hedgeable Categories</CardTitle>
                      <CardDescription>
                        Market search queries based on your spending - no active markets found yet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {risk_analysis.market_queries.map((query: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-sm capitalize">
                            {query}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        We'll search for prediction markets related to these categories to help you hedge your exposure.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </ScrollArea>
  );
}
