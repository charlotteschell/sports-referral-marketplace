import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import BusinessProfile from "./pages/BusinessProfile";
import ReferralOffers from "./pages/ReferralOffers";
import Dashboard from "./pages/Dashboard";
import AddBusiness from "./pages/AddBusiness";
import EditBusiness from "./pages/EditBusiness";
import ManageOffers from "./pages/ManageOffers";
import SendReferral from "./pages/SendReferral";
import Referrals from "./pages/Referrals";
import SubmitBusiness from "./pages/SubmitBusiness";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import SupportTicket from "./pages/SupportTicket";
import Leaderboard from "./pages/Leaderboard";
import Onboarding from "./pages/Onboarding";
import AthleteDashboard from "./pages/AthleteDashboard";
import BetaBanner from "./components/BetaBanner";
import University from "./pages/University";
import UniversityArticle from "./pages/UniversityArticle";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/directory" component={Directory} />
      <Route path="/business/:slug" component={BusinessProfile} />
      <Route path="/referral-offers" component={ReferralOffers} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/add-business" component={AddBusiness} />
      <Route path="/dashboard/edit/:id" component={EditBusiness} />
      <Route path="/dashboard/offers/:id" component={ManageOffers} />
      <Route path="/dashboard/send-referral" component={SendReferral} />
      <Route path="/dashboard/referrals" component={Referrals} />
      <Route path="/submit-business" component={SubmitBusiness} />
      <Route path="/about" component={About} />
      <Route path="/support" component={SupportTicket} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/athlete-dashboard" component={AthleteDashboard} />
      <Route path="/university/:slug" component={UniversityArticle} />
      <Route path="/university" component={University} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <BetaBanner />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
