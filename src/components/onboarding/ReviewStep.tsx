import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, MapPin, Building2, User, DollarSign, Clock, Shield } from 'lucide-react';
import {
  ProfileType,
  getIndustryLabel,
  getCostExposureLabels,
  getBudgetImpactLabels,
  getDebtExposureLabels,
  getTopExpenseLabels,
  getPlanningWindowLabel,
  getRiskStyleLabel,
  exposureRanges,
  hedgeBudgetRanges,
} from './onboarding-data';

interface ReviewStepProps {
  profileType: ProfileType;
  // Business fields
  companyName?: string;
  industry?: string;
  location?: string;
  selectedExposures?: string[];
  planningWindow?: string;
  exposureRange?: number[];
  riskStyle?: string;
  // Individual fields
  individualLocation?: string;
  selectedBudgetImpacts?: string[];
  individualPlanningWindow?: string;
  individualRiskStyle?: string;
  hedgeBudget?: number[];
  selectedDebt?: string[];
  selectedTopExpenses?: string[];
  protectAgainst?: string;
  // Edit mode
  onEdit?: (step: number) => void;
}

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  step?: number;
  onEdit?: (step: number) => void;
  children: React.ReactNode;
}

function ReviewSection({ title, icon, step, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </div>
        {onEdit && step && (
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

export function ReviewStep({
  profileType,
  companyName,
  industry,
  location,
  selectedExposures = [],
  planningWindow,
  exposureRange = [1],
  riskStyle,
  individualLocation,
  selectedBudgetImpacts = [],
  individualPlanningWindow,
  individualRiskStyle,
  hedgeBudget = [1],
  selectedDebt = [],
  selectedTopExpenses = [],
  protectAgainst,
  onEdit,
}: ReviewStepProps) {
  if (profileType === 'business') {
    return (
      <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Check className="h-4 w-4" />
            Review
          </div>
          <CardTitle className="text-2xl">Review Your Profile</CardTitle>
          <CardDescription>
            Please confirm your selections before we set up your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ReviewSection 
            title="Business Basics" 
            icon={<Building2 className="h-4 w-4" />} 
            step={1} 
            onEdit={onEdit}
          >
            <div className="space-y-1">
              <p className="font-medium">{companyName || 'Not specified'}</p>
              <p className="text-sm text-muted-foreground">
                {getIndustryLabel(industry || '')} • {location || 'No location'}
              </p>
            </div>
          </ReviewSection>

          <Separator />

          <ReviewSection 
            title="Cost Exposures" 
            icon={<DollarSign className="h-4 w-4" />} 
            step={2} 
            onEdit={onEdit}
          >
            <div className="flex flex-wrap gap-2">
              {getCostExposureLabels(selectedExposures).map((label) => (
                <Badge key={label} variant="secondary">{label}</Badge>
              ))}
              {selectedExposures.length === 0 && (
                <span className="text-sm text-muted-foreground">None selected</span>
              )}
            </div>
          </ReviewSection>

          <Separator />

          <ReviewSection 
            title="Planning Window" 
            icon={<Clock className="h-4 w-4" />} 
            step={3} 
            onEdit={onEdit}
          >
            <p className="font-medium">{getPlanningWindowLabel(planningWindow || '')}</p>
          </ReviewSection>

          <Separator />

          <ReviewSection 
            title="Exposure & Risk Style" 
            icon={<Shield className="h-4 w-4" />} 
            step={4} 
            onEdit={onEdit}
          >
            <div className="space-y-1">
              <p className="font-medium">
                Monthly exposure: {exposureRanges[exposureRange[0]]?.label || 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">
                Risk style: {getRiskStyleLabel(riskStyle || '')}
              </p>
            </div>
          </ReviewSection>
        </CardContent>
      </Card>
    );
  }

  // Individual review
  return (
    <Card className="glass animate-in fade-in slide-in-from-right-4 duration-500">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Check className="h-4 w-4" />
          Review
        </div>
        <CardTitle className="text-2xl">Review Your Profile</CardTitle>
        <CardDescription>
          Please confirm your selections before we set up your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReviewSection 
          title="Location" 
          icon={<MapPin className="h-4 w-4" />} 
          step={1} 
          onEdit={onEdit}
        >
          <p className="font-medium">{individualLocation || 'Not specified'}</p>
        </ReviewSection>

        <Separator />

        <ReviewSection 
          title="Budget Impacts" 
          icon={<DollarSign className="h-4 w-4" />} 
          step={2} 
          onEdit={onEdit}
        >
          <div className="flex flex-wrap gap-2">
            {getBudgetImpactLabels(selectedBudgetImpacts).map((label) => (
              <Badge key={label} variant="secondary">{label}</Badge>
            ))}
            {selectedBudgetImpacts.length === 0 && (
              <span className="text-sm text-muted-foreground">None selected</span>
            )}
          </div>
        </ReviewSection>

        <Separator />

        <ReviewSection 
          title="Planning & Style" 
          icon={<Clock className="h-4 w-4" />} 
          step={3} 
          onEdit={onEdit}
        >
          <div className="space-y-1">
            <p className="font-medium">
              Planning: {getPlanningWindowLabel(individualPlanningWindow || '')}
            </p>
            <p className="text-sm text-muted-foreground">
              Risk style: {getRiskStyleLabel(individualRiskStyle || '')} • 
              Budget: {hedgeBudgetRanges[hedgeBudget[0]]?.label || 'Not specified'}
            </p>
          </div>
        </ReviewSection>

        <Separator />

        <ReviewSection 
          title="Additional Context" 
          icon={<User className="h-4 w-4" />} 
          step={4} 
          onEdit={onEdit}
        >
          <div className="space-y-2">
            {selectedDebt.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Debt: </span>
                <span className="text-sm">
                  {getDebtExposureLabels(selectedDebt).join(', ')}
                </span>
              </div>
            )}
            {selectedTopExpenses.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Top expenses: </span>
                <span className="text-sm">
                  {getTopExpenseLabels(selectedTopExpenses).join(', ')}
                </span>
              </div>
            )}
            {protectAgainst && (
              <div>
                <span className="text-sm text-muted-foreground">Also protect: </span>
                <span className="text-sm">{protectAgainst}</span>
              </div>
            )}
            {selectedDebt.length === 0 && selectedTopExpenses.length === 0 && !protectAgainst && (
              <span className="text-sm text-muted-foreground">No additional context provided</span>
            )}
          </div>
        </ReviewSection>
      </CardContent>
    </Card>
  );
}
