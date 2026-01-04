import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      navigate('/onboarding');
      return;
    }

    setProfile(data);
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

  const userName = (profile?.profile_json as { name?: string })?.name || user?.email?.split('@')[0] || 'there';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section with Search */}
        <section className="text-center space-y-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome back, <span className="text-gradient">{userName}</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            What risk would you like to hedge today? Search for events, markets, or scenarios.
          </p>
          <SearchBar large />
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card 
              className="glass cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">View Dashboard</CardTitle>
                <CardDescription>
                  Monitor your active hedges and recommendations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="glass cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/profile')}
            >
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Update Risk Profile</CardTitle>
                <CardDescription>
                  Refine your risk preferences and sensitivities
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Updates Section */}
        <section className="py-12">
          <h2 className="text-xl font-semibold mb-6">Latest Updates</h2>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-8">
                <p>No new updates yet. Start exploring markets to get personalized recommendations!</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
