import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import {
  exposureRanges,
  RiskStyle,
} from '@/components/onboarding/onboarding-data';

// Import newly refactored sub-components
import { RiskIdentity } from '@/components/profile/RiskIdentity';
import { ExposureMatrix } from '@/components/profile/ExposureMatrix';
import { HedgingPreferences } from '@/components/profile/HedgingPreferences';

interface ProfileJson {
  name?: string;
  description?: string;
  exposure_range?: string;
  hedge_budget?: string;
  debt_exposures?: string[];
  top_expenses?: string[];
  protect_against?: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // State Management
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
  const [selectedDebt, setSelectedDebt] = useState<string[]>([]);
  const [selectedTopExpenses, setSelectedTopExpenses] = useState<string[]>([]); // Preserved but maybe move to Matrix later
  const [protectAgainst, setProtectAgainst] = useState('');

  const [planningWindow, setPlanningWindow] = useState('90d');
  const [exposureRange, setExposureRange] = useState([1]);
  const [riskStyle, setRiskStyle] = useState<RiskStyle>('balanced');
  const [hedgeBudget, setHedgeBudget] = useState('1000');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) fetchProfile();
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
    const pJson = data.profile_json as ProfileJson;
    const isBiz = data.profile_type === 'business';

    // Hydrate state
    setCompanyName(pJson?.name || '');
    setDescription(pJson?.description || '');
    setLocation(data.region || '');
    setIndustry(data.industry || '');
    
    setSelectedExposures(data.sensitivities || []);
    setSelectedDebt(pJson?.debt_exposures || []);
    setSelectedTopExpenses(pJson?.top_expenses || []);
    setProtectAgainst(pJson?.protect_against || '');

    setPlanningWindow(data.risk_horizon || '90d');
    setRiskStyle(data.risk_style as RiskStyle);
    setHedgeBudget(String(data.hedge_budget_monthly || (isBiz ? 1000 : 500)));
    
    // Parse exposure slider
    const rangeIndex = exposureRanges.findIndex(r => r.label === pJson?.exposure_range);
    setExposureRange([rangeIndex >= 0 ? rangeIndex : 1]);

    setLoading(false);
  };

  const toggleExposure = (id: string) => {
    setSelectedExposures(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleDebt = (id: string) => {
    if (id === 'none') {
      setSelectedDebt(['none']);
    } else {
      setSelectedDebt(prev => {
        const filtered = prev.filter(e => e !== 'none');
        return filtered.includes(id) ? filtered.filter(e => e !== id) : [...filtered, id];
      });
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    
    try {
      const exposureLabel = exposureRanges[exposureRange[0]]?.label || '$5k – $25k';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          industry: industry,
          region: location,
          risk_style: riskStyle,
          risk_horizon: planningWindow,
          sensitivities: selectedExposures,
          hedge_budget_monthly: parseFloat(hedgeBudget) || 0,
          profile_json: { 
            name: companyName,
            description: description || null,
            exposure_range: exposureLabel,
            debt_exposures: selectedDebt,
            top_expenses: selectedTopExpenses,
            protect_against: protectAgainst || null,
          },
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({ title: 'Risk Profile updated', description: 'Your hedging parameters have been saved.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isBusiness = profile?.profile_type === 'business';

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your risk identity and hedging preferences.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-lg hover:shadow-xl transition-all">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>

        {/* Interactive Components Grid */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* 1. Identity */}
          <RiskIdentity 
            isBusiness={isBusiness}
            name={companyName}
            setName={setCompanyName}
            description={description}
            setDescription={setDescription}
            industry={industry}
            setIndustry={setIndustry}
            location={location}
            setLocation={setLocation}
          />

          {/* 2. Exposure Matrix */}
          <ExposureMatrix 
            isBusiness={isBusiness}
            selectedExposures={selectedExposures}
            toggleExposure={toggleExposure}
            selectedDebt={selectedDebt}
            toggleDebt={toggleDebt}
          />

          {/* 3. Hedging Preferences */}
          <HedgingPreferences 
            planningWindow={planningWindow}
            setPlanningWindow={setPlanningWindow}
            exposureRange={exposureRange}
            setExposureRange={setExposureRange}
            hedgeBudget={hedgeBudget}
            setHedgeBudget={setHedgeBudget}
            riskStyle={riskStyle}
            setRiskStyle={setRiskStyle}
          />

        </div>

        <div className="mt-12 text-center">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-2" onClick={() => navigate('/dashboard')}>
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
