import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SubmitTicket from "./pages/SubmitTicket";
import TicketConfirmation from "./pages/TicketConfirmation";
import CheckStatus from "./pages/CheckStatus";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTickets from "./pages/admin/Tickets";
import AdminTicketDetail from "./pages/admin/TicketDetail";
import AdminReports from "./pages/admin/Reports";
import AdminStaff from "./pages/admin/Staff";
import TenantSettings from "./pages/admin/TenantSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import SuperAdminLayout from "./components/SuperAdminLayout";
import SuperAdminOverview from "./pages/superadmin/Overview";
import TenantList from "./pages/superadmin/TenantList";
import CreateTenant from "./pages/superadmin/CreateTenant";
import TenantDetail from "./pages/superadmin/TenantDetail";
import GlobalSearch from "./pages/superadmin/GlobalSearch";
import GlobalStaff from "./pages/superadmin/GlobalStaff";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/submit" component={SubmitTicket} />
      <Route path="/ticket-submitted/:ticketNumber" component={TicketConfirmation} />
      <Route path="/check-status" component={CheckStatus} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/tickets" component={AdminTickets} />
      <Route path="/admin/tickets/:id" component={AdminTicketDetail} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/settings" component={TenantSettings} />
      <Route path="/admin/profile" component={AdminProfile} />

      {/* Super Admin routes */}
      <Route path="/superadmin">
        {() => <SuperAdminLayout><SuperAdminOverview /></SuperAdminLayout>}
      </Route>
      <Route path="/superadmin/tenants">
        {() => <SuperAdminLayout><TenantList /></SuperAdminLayout>}
      </Route>
      <Route path="/superadmin/tenants/new">
        {() => <SuperAdminLayout><CreateTenant /></SuperAdminLayout>}
      </Route>
      <Route path="/superadmin/tenants/:id">
        {() => <SuperAdminLayout><TenantDetail /></SuperAdminLayout>}
      </Route>
      <Route path="/superadmin/search">
        {() => <GlobalSearch />}
      </Route>
      <Route path="/superadmin/staff">
        {() => <GlobalStaff />}
      </Route>

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
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
