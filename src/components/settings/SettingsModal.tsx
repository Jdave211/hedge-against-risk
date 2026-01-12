import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Link2, CreditCard, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type SettingsTab = "account" | "notifications" | "integrations" | "billing";

export function SettingsModal({ children, open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
            <Settings className="h-5 w-5" />
          </button>
        )}
      </DialogTrigger>
      {/* Updated DialogContent to be opaque clean white */}
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl duration-200 sm:rounded-2xl h-[600px] flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-muted/30 border-r border-border p-6 flex flex-col gap-6 shrink-0">
          <div>
            <h2 className="text-lg font-semibold tracking-tight mb-1">Settings</h2>
            <p className="text-xs text-muted-foreground">Manage your workspace</p>
          </div>
          
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto">
             <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-background border border-border mb-4">
                <Avatar className="h-8 w-8 rounded-lg border">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">{user?.email?.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">{user?.email}</span>
                  <span className="text-[10px] text-muted-foreground">Free Plan</span>
                </div>
             </div>
             <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
             </Button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="h-16 border-b border-border/40 flex items-center px-8 shrink-0">
            <h2 className="text-lg font-medium capitalize">{activeTab}</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            
            {activeTab === "account" && (
              <div className="max-w-xl space-y-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Profile Photo</h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 rounded-2xl border-2 border-muted">
                        <AvatarFallback className="text-xl bg-muted/50">
                          {user?.email?.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="bg-background shadow-sm">Upload new</Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Email Address</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted/10 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                      {user?.email}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Contact support to change your email.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="max-w-xl space-y-6">
                <div className="space-y-4">
                   <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Alerts</h3>
                   <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-base">Hedge Recommendations</Label>
                        <p className="text-xs text-muted-foreground">Receive alerts when new hedging opportunities match your profile.</p>
                      </div>
                      <Switch defaultChecked />
                   </div>
                   <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="space-y-0.5">
                        <Label className="text-base">Market Volatility</Label>
                        <p className="text-xs text-muted-foreground">Get notified about significant market moves affecting your positions.</p>
                      </div>
                      <Switch defaultChecked />
                   </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="max-w-2xl space-y-6">
                <div className="text-sm text-muted-foreground mb-4">
                  Connect your accounts to let Probable analyze your portfolio and automate hedging.
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: "Kalshi", desc: "Execute event contracts directly.", connected: true, icon: "K" },
                    { name: "Interactive Brokers", desc: "Import portfolio positions.", connected: false, icon: "IB" },
                    { name: "Robinhood", desc: "Sync equity holdings.", connected: false, icon: "R" },
                    { name: "Coinbase", desc: "Crypto asset coverage.", connected: false, icon: "C" },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all group shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary transition-colors">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-xs text-muted-foreground">{integration.desc}</div>
                          </div>
                       </div>
                       <Button variant={integration.connected ? "outline" : "default"} size="sm" className={integration.connected ? "bg-background" : ""}>
                          {integration.connected ? "Connected" : "Connect"}
                       </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="max-w-xl space-y-6">
                 <div className="p-6 rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-transparent">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Probable Free</h3>
                        <p className="text-sm text-muted-foreground mt-1">Basic hedging recommendations.</p>
                      </div>
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="mt-6">
                       <Button>Upgrade to Pro</Button>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
