import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import FilterSetupPage from "./pages/FilterSetupPage";
import LoadingPage from "./pages/LoadingPage";
import DashboardPage from "./pages/DashboardPage";
import RegionalDashboardPage from "./pages/RegionalDashboardPage";
import TopCandidatesPage from "./pages/TopCandidatesPage";
import CandidateDetailPage from "./pages/CandidateDetailPage";
import MethodologyPage from "./pages/MethodologyPage";
import ReportLoadingPage from "./pages/ReportLoadingPage";
import ReportResultPage from "./pages/ReportResultPage";
import EmailDraftPage from "./pages/EmailDraftPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/filter",
    Component: FilterSetupPage,
  },
  {
    path: "/loading",
    Component: LoadingPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/dashboard/regional",
    Component: RegionalDashboardPage,
  },
  {
    path: "/top-candidates",
    Component: TopCandidatesPage,
  },
  {
    path: "/candidate/:id",
    Component: CandidateDetailPage,
  },
  {
    path: "/candidate/:id/report-complete",
    Component: ReportLoadingPage,
  },
  {
    path: "/candidate/:id/report",
    Component: ReportResultPage,
  },
  {
    path: "/candidate/:id/email-draft",
    Component: EmailDraftPage,
  },
  {
    path: "/methodology",
    Component: MethodologyPage,
  },
]);
