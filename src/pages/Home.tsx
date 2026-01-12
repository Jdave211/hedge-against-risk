import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ArrowRight,
  MessageSquare,
  LayoutDashboard,
  User,
  TrendingUp, 
  Loader2,
  Cloud,
  Zap,
  DollarSign,
  Thermometer,
  Briefcase,
  ShoppingCart,
  Wheat,
  Plane,
  Building2,
  Bitcoin,
  Globe,
  Activity,
  Truck,
  Home as HomeIcon,
  Users,
  GraduationCap,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { EncryptedText } from "@/components/ui/encrypted-text";

type Profile = Tables<"profiles">;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const bucketRef = useRef<HTMLDivElement>(null);
  const [visibleCardIndices, setVisibleCardIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (error || !data) {
      navigate("/onboarding");
      return;
    }
    setProfile(data);
    setLoading(false);
  };

  // Rotate cards in and out every 8 seconds
  useEffect(() => {
    const totalCards = 16;
    const cardsToShow = 8;
    
    const interval = setInterval(() => {
      setVisibleCardIndices(prev => {
        // Get next batch of indices
        const startIndex = (prev[0] + 1) % totalCards;
        const newIndices = [];
        for (let i = 0; i < cardsToShow; i++) {
          newIndices.push((startIndex + i) % totalCards);
        }
        return newIndices;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine display name
  let displayName = "Trader";
  if (profile?.profile_json && typeof profile.profile_json === 'object') {
     const pJson = profile.profile_json as Record<string, any>;
     if (pJson.name) displayName = pJson.name;
  }
  // Fallback to email username if name is not set
  if (displayName === "Trader" && user?.email) {
    displayName = user.email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }

  const suggestedPrompts = [
    { label: "Inflation risk", query: "inflation rising" },
    { label: "Rate cuts", query: "Fed cuts in 2026" },
    { label: "Oil spike", query: "oil spike" },
    { label: "Recession", query: "US recession this year" },
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col min-h-full w-full max-w-6xl mx-auto px-6 py-12">
        {/* Centered Hero / Search */}
        <div className="mt-10 flex flex-col items-center text-center gap-6">
          <div className="flex items-center justify-center min-h-[44px]">
            <EncryptedText
              text={`Welcome to Probable, ${displayName}`}
              className="text-3xl font-medium"
              encryptedClassName="text-muted-foreground"
              revealedClassName="text-foreground font-semibold"
              revealDelayMs={40}
            />
          </div>

          <div className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Tell us what you want covered. We’ll suggest hedges — and a clear dollar amount to hedge.
          </div>

          <div className="w-full max-w-2xl">
            <SearchBar
              large
              placeholder="Describe what you want to hedge (e.g., inflation, rate cuts, oil spike)…"
              searchPath="/chat"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestedPrompts.map((p) => (
              <Button
                key={p.query}
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => navigate(`/chat?q=${encodeURIComponent(p.query)}`)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="bg-background">
                Next steps
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <SheetHeader>
                <SheetTitle>Next steps</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                <Button className="w-full justify-between" onClick={() => navigate("/chat")}>
                  Talk about your risk
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background"
                  onClick={() => navigate("/dashboard")}
                >
                  Review recommendations
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-background"
                  onClick={() => navigate("/profile")}
                >
                  Update risk profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Card className="glass mt-3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Recent</CardTitle>
                    <CardDescription>Your latest activity will show up here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      No recent activity yet — run your first chat to generate hedge suggestions.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick actions */}
        <div className="mt-12 space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Quick actions
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card
              className="group cursor-pointer hover:border-primary/50 transition-colors bg-card border-border shadow-sm"
              onClick={() => navigate("/chat")}
            >
              <CardHeader className="p-5 pb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-medium">Start a chat</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <CardDescription className="line-clamp-2">
                  Talk through your risk and get a hedge plan.
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:border-primary/50 transition-colors bg-card border-border shadow-sm"
              onClick={() => navigate("/dashboard")}
            >
              <CardHeader className="p-5 pb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-medium">Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <CardDescription className="line-clamp-2">
                  Track recommendations and what to do next.
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer hover:border-primary/50 transition-colors bg-card border-border shadow-sm"
              onClick={() => navigate("/profile")}
            >
              <CardHeader className="p-5 pb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-medium">Risk profile</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <CardDescription className="line-clamp-2">
                  Update exposures so suggestions stay relevant.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hedging Examples - Physics Bucket Animation */}
        <div className="mt-16 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              What you can hedge
            </h2>
            <p className="text-xs text-muted-foreground mt-2">
              Beyond prices — hedge real events that impact your business · Drag to explore · New cards every 8s
            </p>
          </div>

          {/* Bucket Container */}
          <div className="relative mx-auto max-w-5xl">
            {/* Bucket visual effect - curved bottom container */}
            <div 
              ref={bucketRef}
              className="relative rounded-3xl border-4 border-primary/20 bg-gradient-to-b from-background/50 to-muted/30 backdrop-blur-sm overflow-hidden"
              style={{ 
                minHeight: '700px',
                boxShadow: 'inset 0 -20px 40px -20px rgba(0,0,0,0.1)',
              }}
            >
              {/* Bucket items */}
              <div className="absolute inset-0 p-4">
                <AnimatePresence mode="popLayout">
                {(() => {
                  const allCards = [
                    {
                      icon: Cloud,
                      title: "Weather Events",
                      example: "Hurricane hits Southeast",
                      color: "bg-blue-500/10",
                    },
                    {
                      icon: Zap,
                      title: "Policy Changes",
                      example: "Minimum wage increase",
                      color: "bg-yellow-500/10",
                    },
                    {
                      icon: DollarSign,
                      title: "Interest Rates",
                      example: "Fed rate hike 0.5%+",
                      color: "bg-green-500/10",
                    },
                    {
                      icon: Thermometer,
                      title: "Oil & Energy",
                      example: "Oil over $100/barrel",
                      color: "bg-red-500/10",
                    },
                    {
                      icon: Briefcase,
                      title: "Supply Chain",
                      example: "Port strikes 2+ weeks",
                      color: "bg-purple-500/10",
                    },
                    {
                      icon: ShoppingCart,
                      title: "Retail Trends",
                      example: "Holiday sales under 5%",
                      color: "bg-pink-500/10",
                    },
                    {
                      icon: Wheat,
                      title: "Food Prices",
                      example: "Wheat prices spike 30%",
                      color: "bg-orange-500/10",
                    },
                    {
                      icon: Plane,
                      title: "Travel Demand",
                      example: "Flight bookings drop 25%",
                      color: "bg-sky-500/10",
                    },
                    {
                      icon: Building2,
                      title: "Real Estate",
                      example: "Commercial vacancy over 20%",
                      color: "bg-indigo-500/10",
                    },
                    {
                      icon: Bitcoin,
                      title: "Crypto Volatility",
                      example: "Bitcoin below $30k",
                      color: "bg-amber-500/10",
                    },
                    {
                      icon: Globe,
                      title: "FX Exposure",
                      example: "Dollar strengthens 10%+",
                      color: "bg-teal-500/10",
                    },
                    {
                      icon: Activity,
                      title: "Market Volatility",
                      example: "VIX exceeds 30",
                      color: "bg-rose-500/10",
                    },
                    {
                      icon: Truck,
                      title: "Logistics Costs",
                      example: "Shipping costs up 40%",
                      color: "bg-cyan-500/10",
                    },
                    {
                      icon: HomeIcon,
                      title: "Mortgage Rates",
                      example: "30-year fixed over 8%",
                      color: "bg-emerald-500/10",
                    },
                    {
                      icon: Users,
                      title: "Labor Market",
                      example: "Unemployment spikes to 6%",
                      color: "bg-violet-500/10",
                    },
                    {
                      icon: GraduationCap,
                      title: "Education Costs",
                      example: "Tuition increases 8%+",
                      color: "bg-fuchsia-500/10",
                    },
                  ];

                  // Grid-based positioning to prevent overlaps
                  // 4 columns x 2 rows for 8 cards
                  const positions = [
                    { x: 30, y: 50 },    // Top-left
                    { x: 230, y: 70 },   // Top-mid-left
                    { x: 430, y: 90 },   // Top-mid-right
                    { x: 630, y: 60 },   // Top-right
                    { x: 30, y: 350 },   // Bottom-left
                    { x: 230, y: 380 },  // Bottom-mid-left
                    { x: 430, y: 360 },  // Bottom-mid-right
                    { x: 630, y: 400 },  // Bottom-right
                  ];

                  return visibleCardIndices.map((cardIndex, posIndex) => {
                    const item = allCards[cardIndex];
                    const pos = positions[posIndex];
                    
                    return (
                      <motion.div
                        key={`${item.title}-${cardIndex}`}
                        drag
                        dragConstraints={bucketRef}
                        dragElastic={0.15}
                        dragTransition={{ 
                          bounceStiffness: 500, 
                          bounceDamping: 20,
                          power: 0.15,
                          min: 5,
                          max: 50,
                        }}
                        initial={{ 
                          opacity: 0, 
                          scale: 0,
                          x: pos.x,
                          y: -250,
                          rotate: Math.random() * 40 - 20,
                        }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          x: pos.x,
                          y: pos.y,
                          rotate: Math.random() * 8 - 4,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0,
                          y: 800,
                          transition: { duration: 0.5 }
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 18,
                          delay: posIndex * 0.08,
                          mass: 0.8,
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          rotate: 0,
                          zIndex: 10,
                          transition: { duration: 0.2 }
                        }}
                        whileDrag={{ 
                          scale: 1.08,
                          rotate: 3,
                          cursor: "grabbing",
                          zIndex: 20,
                          transition: { duration: 0.1 }
                        }}
                        className="absolute cursor-grab active:cursor-grabbing"
                        style={{ 
                          width: '180px',
                          touchAction: 'none',
                        }}
                      >
                        <Card className={`h-full border-2 border-primary/30 ${item.color} backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow select-none`}>
                          <CardHeader className="p-2.5">
                            <div className="flex items-start gap-2">
                              <div className="h-6 w-6 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                <item.icon className="h-3 w-3 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-[11px] font-semibold leading-tight">
                                  {item.title}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-2.5 pt-0">
                            <div className="text-[9px] text-muted-foreground leading-snug">
                              {item.example}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  });
                })()}
                </AnimatePresence>
              </div>

              {/* Bucket bottom curve effect */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" 
                style={{
                  borderRadius: '0 0 100% 100% / 0 0 30px 30px',
                }}
              />
            </div>

            {/* Bucket label */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              Drag to explore
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 text-center"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/chat?q=what can I hedge?")}
            >
              Explore more hedging scenarios
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </ScrollArea>
  );
}
