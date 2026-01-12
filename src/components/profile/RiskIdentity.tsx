import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationCombobox } from "@/components/ui/location-combobox";
import { industries } from "@/components/onboarding/onboarding-data";
import { cn } from "@/lib/utils";
import { Building2, MapPin, FileText } from "lucide-react";

interface RiskIdentityProps {
  isBusiness: boolean;
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
}

export function RiskIdentity({
  isBusiness,
  name,
  setName,
  description,
  setDescription,
  industry,
  setIndustry,
  location,
  setLocation,
}: RiskIdentityProps) {
  return (
    <Card className="glass border-l-4 border-l-primary/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{isBusiness ? "Business Identity" : "Personal Identity"}</CardTitle>
            <CardDescription>
              {isBusiness ? "Core business details that define your risk environment." : "Your location and context."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isBusiness && (
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Logistics"
              className="bg-background/50"
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <div className="[&>button]:pl-9">
              <LocationCombobox
                value={location}
                onChange={setLocation}
                placeholder="Search location..."
              />
            </div>
          </div>
        </div>

        {isBusiness && (
          <div className="grid gap-2">
            <Label>Industry</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {industries.map((ind) => {
                const Icon = ind.icon;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:bg-accent/50",
                      industry === ind.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                        : "border-border bg-background/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      industry === ind.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-xs font-medium text-center">{ind.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Label>Risk Context</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isBusiness ? "Briefly describe your business operations..." : "Briefly describe your situation..."}
              className="min-h-[100px] pl-9 bg-background/50 resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

