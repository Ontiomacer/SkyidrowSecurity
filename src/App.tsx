import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NovaAssistantProvider } from "@/contexts/NovaAssistantContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import SimulationsPage from "./pages/SimulationsPage";
import ResultsPage from "./pages/ResultsPage";
import SplunkPage from "./pages/SplunkPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";
import AnalysisPage from "./pages/AnalysisPage";
import DocumentationPage from "./pages/DocumentationPage";
import OSINTPage from "./pages/OSINTPage";
import ThreatMapPage from "./pages/ThreatMapPage";
import ThreatIntelligencePage from "./pages/ThreatIntelligencePage";
import React, { lazy, Suspense } from "react";

import NewsIndex from './pages/news';
import NewsSubPage from './pages/news/NewsSubPage';
import PublishNews from './pages/news/PublishNews';
import NewsArticlePage from './pages/news/NewsArticlePage';

const queryClient = new QueryClient();
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NovaAssistantProvider>
          <div className="min-h-screen w-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Simulation Results */}
              <Route 
                path="/simulations/results/:ip" 
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/simulations" 
                element={
                  <ProtectedRoute>
                    <SimulationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/simulations/results/:ip" 
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/splunk" 
                element={
                  <ProtectedRoute>
                    <SplunkPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/news/*" 
                element={
                  <ProtectedRoute>
                    <NewsIndex />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<NewsSubPage />} />
                <Route path="publish" element={<PublishNews />} />
                <Route path=":id" element={<NewsArticlePage />} />
              </Route>
              <Route 
                path="/analysis" 
                element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/osint" 
                element={
                  <ProtectedRoute>
                    <OSINTPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/threat-map" 
                element={
                  <ProtectedRoute>
                    <ThreatMapPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/threat-intelligence" 
                element={
                  <ProtectedRoute>
                    <ThreatIntelligencePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documentation" 
                element={
                  <ProtectedRoute>
                    <DocumentationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <AnalyticsPage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={<Navigate to="/" replace />} 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          </NovaAssistantProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
