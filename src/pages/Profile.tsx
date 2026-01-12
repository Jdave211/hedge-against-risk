import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Save, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import {
  exposureRanges,
  RiskStyle,
} from '@/components/onboarding/onboarding-data';
import { Progress } from '@/components/ui/progress';

// Import newly refactored sub-components
import { RiskIdentity } from '@/components/profile/RiskIdentity';
import { ExposureMatrix } from '@/components/profile/ExposureMatrix';
import { HedgingPreferences } from '@/components/profile/HedgingPreferences';

interface ProfileJson {
  name?: string;  // User's personal name
  company_name?: string;  // Business name (for business profiles)
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
  const [userName, setUserName] = useState('');  // User's personal name
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
  const initialSnapshotRef = useRef<string>('');

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
    setUserName(pJson?.name || '');  // User's personal name
    setCompanyName(pJson?.company_name || pJson?.name || '');  // For business: separate field
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

    // Store initial snapshot for dirty-checking
    initialSnapshotRef.current = JSON.stringify({
      companyName: pJson?.name || '',
      industry: data.industry || '',
      location: data.region || '',
      description: pJson?.description || '',
      selectedExposures: data.sensitivities || [],
      selectedDebt: pJson?.debt_exposures || [],
      planningWindow: data.risk_horizon || '90d',
      exposureRange: [rangeIndex >= 0 ? rangeIndex : 1],
      riskStyle: (data.risk_style as RiskStyle) || 'balanced',
      hedgeBudget: String(data.hedge_budget_monthly || (isBiz ? 1000 : 500)),
    });

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
            name: userName || companyName || null,  // User's personal name
            company_name: isBusiness ? companyName : null,  // Business-specific
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

  const isBusiness = profile?.profile_type === 'business';
  const dirty = useMemo(() => {
    const snapshot = JSON.stringify({
      userName,
      companyName,
      industry,
      location,
      description,
      selectedExposures,
      selectedDebt,
      planningWindow,
      exposureRange,
      riskStyle,
      hedgeBudget,
    });
    return initialSnapshotRef.current !== '' && snapshot !== initialSnapshotRef.current;
  }, [
    userName,
    companyName,
    industry,
    location,
    description,
    selectedExposures,
    selectedDebt,
    planningWindow,
    exposureRange,
    riskStyle,
    hedgeBudget,
  ]);

  const completion = useMemo(() => {
    const identityComplete =
      (isBusiness ? companyName.trim().length > 0 && industry.trim().length > 0 : true) &&
      location.trim().length > 0;
    const exposuresComplete = selectedExposures.length > 0;
    const prefsComplete = Number(hedgeBudget) > 0 && !!planningWindow && typeof riskStyle === 'string';

    const steps = [
      { label: 'Identity', done: identityComplete },
      { label: 'Exposure', done: exposuresComplete },
      { label: 'Strategy', done: prefsComplete },
    ];

    const pct = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
    return { pct, steps };
  }, [companyName, industry, location, isBusiness, selectedExposures.length, hedgeBudget, planningWindow, riskStyle]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Risk Profile</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Configure how Probable identifies and manages your hedging needs
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Progress value={completion.pct} className="w-36 h-2" />
                <span className="font-medium text-foreground">{completion.pct}%</span>
                <span>complete</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {dirty ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">Unsaved changes</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">All changes saved</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving || !dirty} 
            size="lg"
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Interactive Components Grid */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* 1. Identity */}
          <div id="risk-identity">
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
          </div>

          {/* 2. Exposure Matrix */}
          <div id="exposure-matrix">
            <ExposureMatrix 
              isBusiness={isBusiness}
              selectedExposures={selectedExposures}
              toggleExposure={toggleExposure}
              selectedDebt={selectedDebt}
              toggleDebt={toggleDebt}
            />
          </div>

          {/* 3. Hedging Preferences */}
          <div id="hedging-preferences">
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

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Changes are applied immediately to your recommendations</p>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 hover:text-foreground" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
