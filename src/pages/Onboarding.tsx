import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { 
  Shield, Building2, User, ArrowRight, ArrowLeft, Loader2, 
  Check, Fuel, Home, Percent, Wheat, Users, CloudRain, Sparkles,
  Car, ShoppingCart, TrendingUp, Zap, Plane, Briefcase, 
  GraduationCap, CreditCard, Landmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ProfileType = 'person' | 'business';
type RiskStyle = 'conservative' | 'balanced' | 'opportunistic';

// ============ BUSINESS DATA ============
const industries = [
  { id: 'technology', label: 'Technology', icon: Sparkles },
  { id: 'retail', label: 'Retail', icon: Building2 },
  { id: 'manufacturing', label: 'Manufacturing', icon: Building2 },
  { id: 'food_service', label: 'Food Service', icon: Wheat },
  { id: 'transportation', label: 'Transportation', icon: Fuel },
  { id: 'real_estate', label: 'Real Estate', icon: Home },
  { id: 'agriculture', label: 'Agriculture', icon: Wheat },
  { id: 'other', label: 'Other', icon: Building2 },
];

const costExposures = [
  { id: 'fuel_energy', label: 'Fuel / Energy', icon: Fuel, description: 'Gas, electricity, transportation costs' },
  { id: 'rent_real_estate', label: 'Rent / Real Estate', icon: Home, description: 'Lease costs, property values' },
  { id: 'interest_rates', label: 'Interest Rates', icon: Percent, description: 'Loans, credit, financing' },
  { id: 'food_commodities', label: 'Food / Commodities', icon: Wheat, description: 'Raw materials, ingredients' },
  { id: 'labor', label: 'Labor', icon: Users, description: 'Wages, staffing costs' },
  { id: 'weather', label: 'Weather Impacts', icon: CloudRain, description: 'Seasonal, climate events' },
];

const planningWindows = [
  { id: '30d', label: 'Next 30 days', description: 'Short-term operational planning' },
  { id: '90d', label: '3 months', description: 'Quarterly business cycles' },
  { id: '180d', label: '6 months', description: 'Semi-annual forecasting' },
  { id: '365d', label: '1 year', description: 'Annual budgeting horizon' },
];

const exposureRanges = [
  { value: 0, label: '< $5k' },
  { value: 1, label: '$5k – $25k' },
  { value: 2, label: '$25k – $100k' },
  { value: 3, label: '$100k+' },
];

const riskStyles = [
  { id: 'conservative', label: 'Conservative', description: 'Prioritize stability and predictable costs' },
  { id: 'balanced', label: 'Balanced', description: 'Balance protection with flexibility' },
  { id: 'opportunistic', label: 'Aggressive', description: 'Accept more variability for potential savings' },
];

// ============ INDIVIDUAL DATA ============
const budgetImpacts = [
  { id: 'rent_housing', label: 'Rent / Housing', icon: Home },
  { id: 'gas_transport', label: 'Gas / Transport', icon: Car },
  { id: 'groceries_food', label: 'Groceries / Food', icon: ShoppingCart },
  { id: 'inflation_cpi', label: 'Inflation (CPI)', icon: TrendingUp },
  { id: 'interest_loans', label: 'Interest Rates / Loans', icon: Percent },
  { id: 'utilities_energy', label: 'Utilities / Energy', icon: Zap },
  { id: 'travel_costs', label: 'Travel Costs', icon: Plane },
  { id: 'job_income_risk', label: 'Job / Income Risk', icon: Briefcase },
];

const individualPlanningWindows = [
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '180d', label: '6 months' },
  { id: '365d', label: '1 year' },
];

const individualRiskStyles = [
  { id: 'conservative', label: 'Conservative' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'opportunistic', label: 'Aggressive' },
];

const hedgeBudgetRanges = [
  { value: 0, label: '< $50' },
  { value: 1, label: '$50 – $200' },
  { value: 2, label: '$200 – $500' },
  { value: 3, label: '$500+' },
];

const debtExposures = [
  { id: 'student_loans', label: 'Student Loans', icon: GraduationCap },
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { id: 'car_loan', label: 'Car Loan', icon: Car },
  { id: 'mortgage', label: 'Mortgage', icon: Landmark },
  { id: 'none', label: 'None', icon: Check },
];

const topExpenses = [
  { id: 'rent', label: 'Rent' },
  { id: 'food', label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'tuition', label: 'Tuition' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'other', label: 'Other' },
];

export default function Onboarding() {
  const [step, setStep] = useState<'type' | 1 | 2 | 3 | 4>('type');
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  
  // ============ BUSINESS STATE ============
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
  const [planningWindow, setPlanningWindow] = useState('90d');
  const [exposureRange, setExposureRange] = useState([1]);
  const [riskStyle, setRiskStyle] = useState<RiskStyle>('balanced');
  
  // ============ INDIVIDUAL STATE ============
  const [individualLocation, setIndividualLocation] = useState('');
  const [selectedBudgetImpacts, setSelectedBudgetImpacts] = useState<string[]>([]);
  const [individualPlanningWindow, setIndividualPlanningWindow] = useState('90d');
  const [individualRiskStyle, setIndividualRiskStyle] = useState<RiskStyle>('balanced');
  const [hedgeBudget, setHedgeBudget] = useState([1]);
  const [selectedDebt, setSelectedDebt] = useState<string[]>([]);
  const [selectedTopExpenses, setSelectedTopExpenses] = useState<string[]>([]);
  const [protectAgainst, setProtectAgainst] = useState('');
  
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      if (!user) {
        navigate('/');
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        navigate('/home');
      }
    };
    
    checkProfile();
  }, [user, authLoading, navigate]);

  const handleTypeSelect = (type: ProfileType) => {
    setProfileType(type);
    setStep(1);
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

  const handleSubmit = async () => {
    if (!user || !profileType) return;

    setLoading(true);
    try {
      if (profileType === 'business') {
        const exposureLabel = exposureRanges[exposureRange[0]]?.label || '$5k – $25k';
        
        const { error } = await supabase.from('profiles').insert({
          user_id: user.id,
          profile_type: profileType,
          region: location,
          industry: industry,
          risk_style: riskStyle,
          risk_horizon: planningWindow,
          sensitivities: selectedExposures,
          profile_json: { 
            name: companyName,
            exposure_range: exposureLabel,
          },
        });

        if (error) throw error;
      } else {
        const budgetLabel = hedgeBudgetRanges[hedgeBudget[0]]?.label || '$50 – $200';
        
        const { error } = await supabase.from('profiles').insert({
          user_id: user.id,
          profile_type: profileType,
          region: individualLocation,
          industry: null,
          risk_style: individualRiskStyle,
          risk_horizon: individualPlanningWindow,
          sensitivities: selectedBudgetImpacts,
          profile_json: { 
            hedge_budget: budgetLabel,
            debt_exposures: selectedDebt,
            top_expenses: selectedTopExpenses,
            protect_against: protectAgainst || null,
          },
        });

        if (error) throw error;
      }

      toast({
        title: 'Profile created!',
        description: `Welcome to Hedge AI. We're ready to help protect your ${profileType === 'business' ? 'business' : 'finances'}.`,
      });
      navigate('/home');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (profileType === 'business') {
      if (step === 1) return companyName.trim() && industry && location;
      if (step === 2) return selectedExposures.length > 0;
      if (step === 3) return planningWindow;
      if (step === 4) return riskStyle;
    } else {
      if (step === 1) return individualLocation;
      if (step === 2) return selectedBudgetImpacts.length > 0;
      if (step === 3) return individualPlanningWindow && individualRiskStyle && hedgeBudget.length > 0;
      if (step === 4) return true; // Optional step
    }
    return false;
  };

  const goBack = () => {
    if (step === 1) setStep('type');
    else if (typeof step === 'number') setStep((step - 1) as 1 | 2 | 3);
  };

  const goNext = () => {
    if (typeof step === 'number' && step < 4) {
      setStep((step + 1) as 2 | 3 | 4);
    } else if (step === 4) {
      handleSubmit();
    }
  };

  const ProgressBar = () => {
    const currentStep = typeof step === 'number' ? step : 0;
    return (
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div 
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-500",
                s <= currentStep ? "bg-primary" : "bg-muted"
              )} 
            />
          </div>
        ))}
      </div>
    );
  };

  // Type selection screen
  if (step === 'type') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-2xl relative space-y-8">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Welcome to Hedge</h1>
            <p className="text-muted-foreground">
              Tell us a bit about yourself so we can personalize your experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="glass cursor-pointer hover:border-primary hover:scale-[1.02] transition-all duration-300"
              onClick={() => handleTypeSelect('person')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Individual</CardTitle>
                <CardDescription>
                  I want to hedge personal risks like weather, travel, or events.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="glass cursor-pointer hover:border-primary hover:scale-[1.02] transition-all duration-300"
              onClick={() => handleTypeSelect('business')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Business</CardTitle>
                <CardDescription>
                  I want to hedge business risks like supply chain, regulations, or markets.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ============ INDIVIDUAL ONBOARDING FLOW ============
  if (profileType === 'person') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full max-w-2xl relative">
          <ProgressBar />
          
          {/* Step 1 - Basics */}
          {step === 1 && (
            <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  Step 1 of 4
                </div>
                <CardTitle className="text-2xl">Basics</CardTitle>
                <CardDescription>
                  Where are you located? This helps us find relevant hedges.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Location</Label>
                  <LocationCombobox
                    value={individualLocation}
                    onChange={setIndividualLocation}
                    placeholder="Search for your location..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2 - Budget Impacts */}
          {step === 2 && (
            <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Shield className="h-4 w-4" />
                  Step 2 of 4
                </div>
                <CardTitle className="text-2xl">What impacts your budget?</CardTitle>
                <CardDescription>
                  Select all areas where price changes affect you.
                </CardDescription>
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
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          "hover:border-primary/50 hover:bg-primary/5",
                          isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {isSelected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                        </div>
                        <span className="text-xs font-medium text-center">{impact.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3 - Planning + Style */}
          {step === 3 && (
            <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Shield className="h-4 w-4" />
                  Step 3 of 4
                </div>
                <CardTitle className="text-2xl">Planning & Style</CardTitle>
                <CardDescription>
                  How do you approach planning and risk?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Planning Window */}
                <div className="space-y-3">
                  <Label className="text-base">How far ahead do you plan for price changes?</Label>
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

                {/* Risk Style */}
                <div className="space-y-3">
                  <Label className="text-base">Risk style</Label>
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

                {/* Monthly Hedge Budget */}
                <div className="space-y-6">
                  <Label className="text-base">Monthly hedge budget</Label>
                  <div className="px-2">
                    <Slider
                      value={hedgeBudget}
                      onValueChange={setHedgeBudget}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-4">
                      {hedgeBudgetRanges.map((range, i) => (
                        <span 
                          key={range.value}
                          className={cn(
                            "text-sm transition-colors",
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
          )}

          {/* Step 4 - Quick Context (Optional) */}
          {step === 4 && (
            <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Shield className="h-4 w-4" />
                  Step 4 of 4 — Optional
                </div>
                <CardTitle className="text-2xl">Quick Context</CardTitle>
                <CardDescription>
                  Help us personalize even more (you can skip this).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Debt Exposure */}
                <div className="space-y-3">
                  <Label className="text-base">Debt exposure</Label>
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
                            "h-5 w-5 transition-colors",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="text-xs font-medium text-center">{debt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Top Expenses */}
                <div className="space-y-3">
                  <Label className="text-base">Top expenses (pick up to 3)</Label>
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
                            "p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200",
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

                {/* Protect Against */}
                <div className="space-y-3">
                  <Label className="text-base">What else would you like to protect against?</Label>
                  <Textarea
                    value={protectAgainst}
                    onChange={(e) => setProtectAgainst(e.target.value)}
                    placeholder="E.g., concert ticket price increases, flight delays, crypto volatility..."
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={goNext}
              disabled={!canProceed() || loading}
              className="gap-2 min-w-[140px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === 4 ? (
                <>
                  Complete Setup
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============ BUSINESS ONBOARDING FLOW ============
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-2xl relative">
        <ProgressBar />
        
        {/* Step 1 - Business Basics */}
        {step === 1 && (
          <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                Step 1 of 4
              </div>
              <CardTitle className="text-2xl">Business Basics</CardTitle>
              <CardDescription>
                Let's start with some information about your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="h-12"
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
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          "hover:border-primary/50 hover:bg-primary/5",
                          industry === ind.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 transition-colors",
                          industry === ind.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-sm font-medium">{ind.label}</span>
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
        )}

        {/* Step 2 - Cost Exposure */}
        {step === 2 && (
          <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                Step 2 of 4
              </div>
              <CardTitle className="text-2xl">Cost Exposure</CardTitle>
              <CardDescription>
                Which costs are most unpredictable for your business? Select all that apply.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {costExposures.map((exposure) => {
                  const Icon = exposure.icon;
                  const isSelected = selectedExposures.includes(exposure.id);
                  return (
                    <button
                      key={exposure.id}
                      type="button"
                      onClick={() => toggleExposure(exposure.id)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "hover:border-primary/50 hover:bg-primary/5",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {isSelected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{exposure.label}</p>
                        <p className="text-sm text-muted-foreground">{exposure.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 - Planning Window */}
        {step === 3 && (
          <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                Step 3 of 4
              </div>
              <CardTitle className="text-2xl">Planning Window</CardTitle>
              <CardDescription>
                How far ahead do you typically plan for cost changes?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {planningWindows.map((window) => (
                  <button
                    key={window.id}
                    type="button"
                    onClick={() => setPlanningWindow(window.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all duration-200",
                      "hover:border-primary/50 hover:bg-primary/5",
                      planningWindow === window.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border"
                    )}
                  >
                    <span className="text-xl font-semibold">{window.label}</span>
                    <span className="text-sm text-muted-foreground text-center">{window.description}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  We'll prioritize risks in this window and still alert you when urgent events happen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 - Exposure Size & Style */}
        {step === 4 && (
          <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                Step 4 of 4
              </div>
              <CardTitle className="text-2xl">Exposure Size & Style</CardTitle>
              <CardDescription>
                Help us understand your risk profile to provide better recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-base">Monthly Cost Exposure</Label>
                  <p className="text-sm text-muted-foreground mb-6">
                    Roughly how much do you spend monthly on variable costs?
                  </p>
                </div>
                
                <div className="px-2">
                  <Slider
                    value={exposureRange}
                    onValueChange={setExposureRange}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-4">
                    {exposureRanges.map((range, i) => (
                      <span 
                        key={range.value}
                        className={cn(
                          "text-sm transition-colors",
                          exposureRange[0] === i ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {range.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base">Risk Preference</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    How would you describe your approach to managing uncertainty?
                  </p>
                </div>
                
                <div className="grid gap-3">
                  {riskStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setRiskStyle(style.id as RiskStyle)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "hover:border-primary/50 hover:bg-primary/5",
                        riskStyle === style.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        riskStyle === style.id 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground"
                      )}>
                        {riskStyle === style.id && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-medium">{style.label}</p>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        {typeof step === 'number' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={goNext}
              disabled={!canProceed() || loading}
              className="gap-2 min-w-[140px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === 4 ? (
                <>
                  Complete Setup
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
