import { 
  Shield, Building2, Fuel, Home, Percent, Wheat, Users, CloudRain, Sparkles,
  Car, ShoppingCart, TrendingUp, Zap, Plane, Briefcase, 
  GraduationCap, CreditCard, Landmark, Check
} from 'lucide-react';

export type ProfileType = 'person' | 'business';
export type RiskStyle = 'conservative' | 'balanced' | 'opportunistic';

// ============ BUSINESS DATA ============
export const industries = [
  { id: 'technology', label: 'Technology', icon: Sparkles },
  { id: 'retail', label: 'Retail', icon: Building2 },
  { id: 'manufacturing', label: 'Manufacturing', icon: Building2 },
  { id: 'food_service', label: 'Food Service', icon: Wheat },
  { id: 'transportation', label: 'Transportation', icon: Fuel },
  { id: 'real_estate', label: 'Real Estate', icon: Home },
  { id: 'agriculture', label: 'Agriculture', icon: Wheat },
  { id: 'other', label: 'Other', icon: Building2 },
];

export const costExposures = [
  { id: 'fuel_energy', label: 'Fuel / Energy', icon: Fuel, description: 'Gas, electricity, transportation costs' },
  { id: 'rent_real_estate', label: 'Rent / Real Estate', icon: Home, description: 'Lease costs, property values' },
  { id: 'interest_rates', label: 'Interest Rates', icon: Percent, description: 'Loans, credit, financing' },
  { id: 'food_commodities', label: 'Food / Commodities', icon: Wheat, description: 'Raw materials, ingredients' },
  { id: 'labor', label: 'Labor', icon: Users, description: 'Wages, staffing costs' },
  { id: 'weather', label: 'Weather Impacts', icon: CloudRain, description: 'Seasonal, climate events' },
];

export const planningWindows = [
  { id: '30d', label: 'Next 30 days', description: 'Short-term operational planning' },
  { id: '90d', label: '3 months', description: 'Quarterly business cycles' },
  { id: '180d', label: '6 months', description: 'Semi-annual forecasting' },
  { id: '365d', label: '1 year', description: 'Annual budgeting horizon' },
];

export const exposureRanges = [
  { value: 0, label: '< $5k' },
  { value: 1, label: '$5k – $25k' },
  { value: 2, label: '$25k – $100k' },
  { value: 3, label: '$100k+' },
];

export const riskStyles = [
  { id: 'conservative', label: 'Conservative', description: 'Prioritize stability and predictable costs' },
  { id: 'balanced', label: 'Balanced', description: 'Balance protection with flexibility' },
  { id: 'opportunistic', label: 'Aggressive', description: 'Accept more variability for potential savings' },
];

// ============ INDIVIDUAL DATA ============
export const budgetImpacts = [
  { id: 'rent_housing', label: 'Rent / Housing', icon: Home },
  { id: 'gas_transport', label: 'Gas / Transport', icon: Car },
  { id: 'groceries_food', label: 'Groceries / Food', icon: ShoppingCart },
  { id: 'inflation_cpi', label: 'Inflation (CPI)', icon: TrendingUp },
  { id: 'interest_loans', label: 'Interest Rates / Loans', icon: Percent },
  { id: 'utilities_energy', label: 'Utilities / Energy', icon: Zap },
  { id: 'travel_costs', label: 'Travel Costs', icon: Plane },
  { id: 'job_income_risk', label: 'Job / Income Risk', icon: Briefcase },
];

export const individualPlanningWindows = [
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '180d', label: '6 months' },
  { id: '365d', label: '1 year' },
];

export const individualRiskStyles = [
  { id: 'conservative', label: 'Conservative' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'opportunistic', label: 'Aggressive' },
];

export const hedgeBudgetRanges = [
  { value: 0, label: '< $50' },
  { value: 1, label: '$50 – $200' },
  { value: 2, label: '$200 – $500' },
  { value: 3, label: '$500+' },
];

export const debtExposures = [
  { id: 'student_loans', label: 'Student Loans', icon: GraduationCap },
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { id: 'car_loan', label: 'Car Loan', icon: Car },
  { id: 'mortgage', label: 'Mortgage', icon: Landmark },
  { id: 'none', label: 'None', icon: Check },
];

export const topExpenses = [
  { id: 'rent', label: 'Rent' },
  { id: 'food', label: 'Food' },
  { id: 'transport', label: 'Transport' },
  { id: 'tuition', label: 'Tuition' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'other', label: 'Other' },
];

// Helper functions
export const getIndustryLabel = (id: string) => industries.find(i => i.id === id)?.label || id;
export const getCostExposureLabels = (ids: string[]) => ids.map(id => costExposures.find(e => e.id === id)?.label || id);
export const getBudgetImpactLabels = (ids: string[]) => ids.map(id => budgetImpacts.find(b => b.id === id)?.label || id);
export const getDebtExposureLabels = (ids: string[]) => ids.map(id => debtExposures.find(d => d.id === id)?.label || id);
export const getTopExpenseLabels = (ids: string[]) => ids.map(id => topExpenses.find(e => e.id === id)?.label || id);
export const getPlanningWindowLabel = (id: string) => planningWindows.find(w => w.id === id)?.label || individualPlanningWindows.find(w => w.id === id)?.label || id;
export const getRiskStyleLabel = (id: string) => riskStyles.find(s => s.id === id)?.label || id;
