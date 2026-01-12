import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sliders, CalendarDays, Wallet } from "lucide-react";
import {
  planningWindows,
  exposureRanges,
  riskStyles,
  RiskStyle,
} from "@/components/onboarding/onboarding-data";

interface HedgingPreferencesProps {
  planningWindow: string;
  setPlanningWindow: (val: string) => void;
  exposureRange: number[];
  setExposureRange: (val: number[]) => void;
  hedgeBudget: string;
  setHedgeBudget: (val: string) => void;
  riskStyle: RiskStyle;
  setRiskStyle: (val: RiskStyle) => void;
}

export function HedgingPreferences({
  planningWindow,
  setPlanningWindow,
  exposureRange,
  setExposureRange,
  hedgeBudget,
  setHedgeBudget,
  riskStyle,
  setRiskStyle,
}: HedgingPreferencesProps) {
  return (
    <Card className="glass border-l-4 border-l-blue-500/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Strategy Preferences</CardTitle>
            <CardDescription>Configure how Hedge AI constructs your protection strategy.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Planning Horizon */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Planning Horizon
            </Label>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              {planningWindows.find(w => w.id === planningWindow)?.label}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {planningWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => setPlanningWindow(window.id)}
                className={cn(
                  "h-10 rounded-lg text-xs font-medium transition-all border",
                  planningWindow === window.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background/50 border-border hover:bg-accent"
                )}
              >
                {window.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exposure Slider */}
        <div className="space-y-4">
          <Label className="flex items-center justify-between">
            <span>Est. Monthly Exposure</span>
            <span className="text-primary font-bold">
              {exposureRanges[exposureRange[0]]?.label}
            </span>
          </Label>
          <div className="pt-2 px-1">
            <Slider
              value={exposureRange}
              onValueChange={setExposureRange}
              max={3}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
              <span>Critical</span>
            </div>
          </div>
        </div>

        {/* Budget Input */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Monthly Hedge Budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
            <Input
              type="number"
              value={hedgeBudget}
              onChange={(e) => setHedgeBudget(e.target.value)}
              className="pl-8 font-mono text-lg bg-background/50"
            />
          </div>
        </div>

        {/* Risk Style Grid */}
        <div className="space-y-4">
          <Label>Risk Appetite</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {riskStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setRiskStyle(style.id as RiskStyle)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all hover:bg-accent/50",
                  riskStyle === style.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold capitalize">{style.label}</span>
                  {riskStyle === style.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {style.description}
                </p>
              </button>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

