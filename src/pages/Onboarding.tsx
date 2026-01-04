import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { 
  Shield, Building2, User, ArrowRight, ArrowLeft, Loader2, 
  Check, Fuel, Home, Percent, Wheat, Users, CloudRain, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ProfileType = 'person' | 'business';
type RiskStyle = 'conservative' | 'balanced' | 'opportunistic';

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

// Removed regions array - now using LocationCombobox

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

export default function Onboarding() {
  const [step, setStep] = useState<'type' | 1 | 2 | 3 | 4>('type');
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  
  // Step 1 - Business basics
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  
  // Step 2 - Cost exposure
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
  
  // Step 3 - Planning window
  const [planningWindow, setPlanningWindow] = useState('90d');
  
  // Step 4 - Exposure size & style
  const [exposureRange, setExposureRange] = useState([1]);
  const [riskStyle, setRiskStyle] = useState<RiskStyle>('balanced');
  
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to home if user already has a profile
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
    if (type === 'business') {
      setStep(1);
    } else {
      // For individual, go to a simpler flow (keeping existing behavior)
      setStep(1);
    }
  };

  const toggleExposure = (id: string) => {
    setSelectedExposures(prev => 
      prev.includes(id) 
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user || !profileType) return;

    setLoading(true);
    try {
      const exposureLabel = exposureRanges[exposureRange[0]]?.label || '$5k – $25k';
      
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        profile_type: profileType,
        region: location,
        industry: profileType === 'business' ? industry : null,
        risk_style: riskStyle,
        risk_horizon: planningWindow,
        sensitivities: selectedExposures,
        profile_json: { 
          name: companyName,
          exposure_range: exposureLabel,
        },
      });

      if (error) throw error;

      toast({
        title: 'Profile created!',
        description: 'Welcome to Hedge AI. We\'re ready to help protect your business.',
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
    if (step === 1) return companyName.trim() && industry && location;
    if (step === 2) return selectedExposures.length > 0;
    if (step === 3) return planningWindow;
    if (step === 4) return riskStyle;
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

  // Progress indicator
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
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-primary/20">
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
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-primary/20">
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

  // Business onboarding flow
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
