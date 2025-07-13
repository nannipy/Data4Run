import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Activity, Settings, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-gradient-card px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Strava Run Analyzer</h1>
              <p className="text-sm text-muted-foreground">Performance Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-success text-success-foreground">
            <Activity className="w-3 h-3 mr-1" />
            Connected
          </Badge>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}