import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/activities" element={<Layout><Activities /></Layout>} />
          <Route path="/trends" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Trends Analysis</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          <Route path="/goals" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Goals</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          <Route path="/performance" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Performance</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          <Route path="/routes" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Routes</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          <Route path="/calendar" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Calendar</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          <Route path="/social" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Social</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
