import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageSquare, LayoutDashboard, User, LogOut, Settings, Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/settings/SettingsModal";
import probableLogo from "@/assets/probable3.png";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const activeTint = "text-primary";
  const activeBg = "bg-primary/10";

  const items = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: MessageSquare,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ];

  return (
    <Sidebar 
      collapsible="none" 
      className="w-[92px] h-full border-y-2 border-r-2 border-border bg-sidebar flex flex-col items-center py-4 gap-4"
    >
      <SidebarHeader className="p-0 mb-4">
        <img
          src={probableLogo}
          alt="Probable"
          className="h-19 w-16 object-contain"
          draggable={false}
        />
      </SidebarHeader>
      
      <SidebarContent className="flex flex-col items-center gap-2 w-full px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col items-center gap-1.5">
              {items.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.url)}
                      tooltip={item.title}
                      className={cn(
                        "w-full h-auto py-2 justify-center rounded-xl transition-all duration-200 flex flex-col gap-1",
                        isActive 
                          ? cn(activeBg, activeTint, "shadow-none")
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-[11px] font-medium leading-tight text-center">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto p-0 flex flex-col items-center gap-2 px-2 pb-4">
        {/* Settings Icon - Now opens SettingsModal */}
        <SettingsModal>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
          </button>
        </SettingsModal>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full overflow-hidden border border-border transition-all hover:ring-2 hover:ring-primary/20 bg-background">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            side="right" 
            className="w-64 p-2 ml-2 rounded-xl shadow-lg border-border bg-background"
            sideOffset={10}
          >
            {/* User Header */}
            <div className="flex items-center gap-3 p-2 mb-1">
              <Avatar className="h-9 w-9 rounded-lg border">
                <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>
            </div>
            
            <DropdownMenuSeparator className="my-1 opacity-50" />
            
            {/* Menu Items */}
            <DropdownMenuItem 
              onClick={() => {}} // Could open notifications panel
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer focus:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Notifications</span>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => signOut()}
              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer focus:bg-muted text-muted-foreground hover:text-foreground mt-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
