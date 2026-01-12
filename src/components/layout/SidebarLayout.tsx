import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileNotificationsDropdown } from "@/components/notifications/MobileNotificationsDropdown";
import { SecondarySidebar } from "@/components/layout/secondary/SecondarySidebar";
import { ReactNode } from "react";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider className="h-screen w-full overflow-hidden flex bg-background">
      {/* 1. Main Rail (Fixed width handled by component) */}
      <AppSidebar />
      
      {/* 2. Secondary Sidebar (Fixed width, full height) - Opaque background */}
      <div className="hidden md:flex h-full flex-col border-y-2 border-r-2 border-border bg-sidebar w-[280px] shrink-0">
        <SecondarySidebar />
      </div>

      {/* 3. Main Content Area (Flexgrow, handles its own scrolling) */}
      <SidebarInset className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
             <MobileNotificationsDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background h-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
