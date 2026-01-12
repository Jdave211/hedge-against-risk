import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ShieldAlert } from "lucide-react";
import { costExposures, budgetImpacts, debtExposures } from "@/components/onboarding/onboarding-data";

interface ExposureMatrixProps {
  isBusiness: boolean;
  selectedExposures: string[];
  toggleExposure: (id: string) => void;
  selectedDebt: string[];
  toggleDebt: (id: string) => void;
}

export function ExposureMatrix({
  isBusiness,
  selectedExposures,
  toggleExposure,
  selectedDebt,
  toggleDebt,
}: ExposureMatrixProps) {
  const items = isBusiness ? costExposures : budgetImpacts;

  return (
    <Card className="glass border-l-4 border-l-primary/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Exposure Matrix</CardTitle>
            <CardDescription>Select the factors that most threaten your financial stability.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Exposures</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedExposures.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleExposure(item.id)}
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-md text-left group",
                    isSelected 
                      ? "border-primary/50 bg-primary/5" 
                      : "border-border bg-background/50 hover:bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {isSelected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-sm block">{item.label}</span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {isBusiness ? (item as any).description : "Impacts monthly budget stability."}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {!isBusiness && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Debt & Liabilities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {debtExposures.map((debt) => {
                const Icon = debt.icon;
                const isSelected = selectedDebt.includes(debt.id);
                return (
                  <button
                    key={debt.id}
                    onClick={() => toggleDebt(debt.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:bg-accent/50",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6 mb-2 transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-xs font-medium text-center">{debt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
