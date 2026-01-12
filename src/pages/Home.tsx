import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { EncryptedText } from "@/components/ui/encrypted-text";

type Profile = Tables<"profiles">;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      </div>
    </ScrollArea>
  );
}
