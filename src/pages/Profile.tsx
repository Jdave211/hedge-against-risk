import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { Loader2, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import {
  ProfileType,
  RiskStyle,
  industries,
  costExposures,
  planningWindows,
  exposureRanges,
  riskStyles,
  budgetImpacts,
  individualPlanningWindows,
  individualRiskStyles,
  hedgeBudgetRanges,
  debtExposures,
  topExpenses,
} from '@/components/onboarding/onboarding-data';

interface ProfileJson {
  name?: string;
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

  // Business fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
  const [planningWindow, setPlanningWindow] = useState('90d');
  const [exposureRange, setExposureRange] = useState([1]);
  const [riskStyle, setRiskStyle] = useState<RiskStyle>('balanced');

  // Individual fields
  const [individualLocation, setIndividualLocation] = useState('');
  const [selectedBudgetImpacts, setSelectedBudgetImpacts] = useState<string[]>([]);
  const [individualPlanningWindow, setIndividualPlanningWindow] = useState('90d');
  const [individualRiskStyle, setIndividualRiskStyle] = useState<RiskStyle>('balanced');
  const [hedgeBudget, setHedgeBudget] = useState([1]);
  const [selectedDebt, setSelectedDebt] = useState<string[]>([]);
  const [selectedTopExpenses, setSelectedTopExpenses] = useState<string[]>([]);
  const [protectAgainst, setProtectAgainst] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
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
    const profileJson = data.profile_json as ProfileJson;

    if (data.profile_type === 'business') {
      setCompanyName(profileJson?.name || '');
      setIndustry(data.industry || '');
      setLocation(data.region || '');
      setSelectedExposures(data.sensitivities || []);
      setPlanningWindow(data.risk_horizon || '90d');
      setRiskStyle(data.risk_style);
      // Parse exposure range from label
      const rangeIndex = exposureRanges.findIndex(r => r.label === profileJson?.exposure_range);
      setExposureRange([rangeIndex >= 0 ? rangeIndex : 1]);
    } else {
      setIndividualLocation(data.region || '');
      setSelectedBudgetImpacts(data.sensitivities || []);
      setIndividualPlanningWindow(data.risk_horizon || '90d');
      setIndividualRiskStyle(data.risk_style);
      // Parse hedge budget from label
      const budgetIndex = hedgeBudgetRanges.findIndex(r => r.label === profileJson?.hedge_budget);
      setHedgeBudget([budgetIndex >= 0 ? budgetIndex : 1]);
      setSelectedDebt(profileJson?.debt_exposures || []);
      setSelectedTopExpenses(profileJson?.top_expenses || []);
      setProtectAgainst(profileJson?.protect_against || '');
    }

    setLoading(false);
  };

  const toggleExposure = (id: string) => {
    setSelectedExposures(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleBudgetImpact = (id: string) => {
    setSelectedBudgetImpacts(prev =>
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

  const toggleTopExpense = (id: string) => {
    setSelectedTopExpenses(prev => {
      if (prev.includes(id)) return prev.filter(e => e !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      if (profile.profile_type === 'business') {
        const exposureLabel = exposureRanges[exposureRange[0]]?.label || '$5k – $25k';
        
        const { error } = await supabase
          .from('profiles')
          .update({
            industry: industry,
            region: location,
            risk_style: riskStyle,
            risk_horizon: planningWindow,
            sensitivities: selectedExposures,
            profile_json: { 
              name: companyName,
              exposure_range: exposureLabel,
            },
          })
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        const budgetLabel = hedgeBudgetRanges[hedgeBudget[0]]?.label || '$50 – $200';
        
        const { error } = await supabase
          .from('profiles')
          .update({
            region: individualLocation,
            risk_style: individualRiskStyle,
            risk_horizon: individualPlanningWindow,
            sensitivities: selectedBudgetImpacts,
            profile_json: { 
              hedge_budget: budgetLabel,
              debt_exposures: selectedDebt,
              top_expenses: selectedTopExpenses,
              protect_against: protectAgainst || null,
            },
          })
          .eq('id', profile.id);

        if (error) throw error;
      }

      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
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

  const isBusiness = profile?.profile_type === 'business';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and hedging preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Type</Label>
                <p className="text-sm capitalize">{profile?.profile_type}</p>
              </div>
            </CardContent>
          </Card>

          {isBusiness ? (
            <>
              {/* Business Basics */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Business Basics</CardTitle>
                  <CardDescription>Your business information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Industry</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {industries.map((ind) => {
                        const Icon = ind.icon;
                        return (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => setIndustry(ind.id)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                              "hover:border-primary/50 hover:bg-primary/5",
                              industry === ind.id 
                                ? "border-primary bg-primary/10" 
                                : "border-border"
                            )}
                          >
                            <Icon className={cn(
                              "h-4 w-4 transition-colors",
                              industry === ind.id ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className="text-xs font-medium">{ind.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Location</Label>
                    <LocationCombobox
                      value={location}
                      onChange={setLocation}
                      placeholder="Search for your location..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cost Exposure */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Cost Exposure</CardTitle>
                  <CardDescription>Which costs are most unpredictable?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {costExposures.map((exposure) => {
                      const Icon = exposure.icon;
                      const isSelected = selectedExposures.includes(exposure.id);
                      return (
                        <button
                          key={exposure.id}
                          type="button"
                          onClick={() => toggleExposure(exposure.id)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5",
                            isSelected 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {isSelected ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{exposure.label}</p>
                            <p className="text-xs text-muted-foreground">{exposure.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Planning & Risk */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Planning & Risk</CardTitle>
                  <CardDescription>Your planning horizon and risk preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Planning Window</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {planningWindows.map((window) => (
                        <button
                          key={window.id}
                          type="button"
                          onClick={() => setPlanningWindow(window.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5",
                            planningWindow === window.id 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          )}
                        >
                          {window.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Monthly Cost Exposure</Label>
                    <div className="px-2">
                      <Slider
                        value={exposureRange}
                        onValueChange={setExposureRange}
                        max={3}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-3">
                        {exposureRanges.map((range, i) => (
                          <span 
                            key={range.value}
                            className={cn(
                              "text-xs transition-colors",
                              exposureRange[0] === i ? "text-primary font-medium" : "text-muted-foreground"
                            )}
                          >
                            {range.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Risk Style</Label>
                    <div className="grid gap-2">
                      {riskStyles.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setRiskStyle(style.id as RiskStyle)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5",
                            riskStyle === style.id 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          )}
                        >
                          <div className={cn(
                            "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                            riskStyle === style.id 
                              ? "border-primary bg-primary" 
                              : "border-muted-foreground"
                          )}>
                            {riskStyle === style.id && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{style.label}</p>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Individual Location */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>Where are you located?</CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationCombobox
                    value={individualLocation}
                    onChange={setIndividualLocation}
                    placeholder="Search for your location..."
                  />
                </CardContent>
              </Card>

              {/* Budget Impacts */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Budget Impacts</CardTitle>
                  <CardDescription>What impacts your budget?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {budgetImpacts.map((impact) => {
                      const Icon = impact.icon;
                      const isSelected = selectedBudgetImpacts.includes(impact.id);
                      return (
                        <button
                          key={impact.id}
                          type="button"
                          onClick={() => toggleBudgetImpact(impact.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5",
                            isSelected 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          )}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {isSelected ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <span className="text-xs font-medium text-center">{impact.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Planning & Style */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Planning & Style</CardTitle>
                  <CardDescription>Your planning approach and risk preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Planning Window</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {individualPlanningWindows.map((window) => (
                        <button
                          key={window.id}
                          type="button"
                          onClick={() => setIndividualPlanningWindow(window.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5",
                            individualPlanningWindow === window.id 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          )}
                        >
                          {window.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Risk Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {individualRiskStyles.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setIndividualRiskStyle(style.id as RiskStyle)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                            "hover:border-primary/50 hover:bg-primary/5",
                            individualRiskStyle === style.id 
                              ? "border-primary bg-primary/10" 
                              : "border-border"
                          )}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Monthly Hedge Budget</Label>
                    <div className="px-2">
                      <Slider
                        value={hedgeBudget}
                        onValueChange={setHedgeBudget}
                        max={3}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-3">
                        {hedgeBudgetRanges.map((range, i) => (
                          <span 
                            key={range.value}
                            className={cn(
                              "text-xs transition-colors",
                              hedgeBudget[0] === i ? "text-primary font-medium" : "text-muted-foreground"
                            )}
                          >
                            {range.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Context */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Additional Context</CardTitle>
                  <CardDescription>Optional details to personalize recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Debt Exposure</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {debtExposures.map((debt) => {
                        const Icon = debt.icon;
                        const isSelected = selectedDebt.includes(debt.id);
                        return (
                          <button
                            key={debt.id}
                            type="button"
                            onClick={() => toggleDebt(debt.id)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                              "hover:border-primary/50 hover:bg-primary/5",
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-border"
                            )}
                          >
                            <Icon className={cn(
                              "h-4 w-4 transition-colors",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className="text-xs font-medium text-center">{debt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Top Expenses (pick up to 3)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {topExpenses.map((expense) => {
                        const isSelected = selectedTopExpenses.includes(expense.id);
                        const isDisabled = !isSelected && selectedTopExpenses.length >= 3;
                        return (
                          <button
                            key={expense.id}
                            type="button"
                            onClick={() => toggleTopExpense(expense.id)}
                            disabled={isDisabled}
                            className={cn(
                              "p-2 rounded-xl border-2 text-xs font-medium transition-all duration-200",
                              "hover:border-primary/50 hover:bg-primary/5",
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-border",
                              isDisabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent"
                            )}
                          >
                            {expense.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>What else would you like to protect against?</Label>
                    <Textarea
                      value={protectAgainst}
                      onChange={(e) => setProtectAgainst(e.target.value)}
                      placeholder="E.g., concert ticket price increases, flight delays..."
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </Layout>
  );
}
