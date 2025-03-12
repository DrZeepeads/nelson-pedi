
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LayoutContainer } from "./components/LayoutContainer";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Calculator from "./pages/Calculator";
import GrowthCharts from "./pages/GrowthCharts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LayoutContainer>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/growth-charts" element={<GrowthCharts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutContainer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
