import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";

import LandingPage from "@/pages/public/LandingPage";
import DirectoryPage from "@/pages/public/DirectoryPage";
import InfluencerPublicPage from "@/pages/public/InfluencerPublicPage";
import PricingPage from "@/pages/public/PricingPage";
import AuthPage from "@/pages/auth/AuthPage";

import InfluencerHomePage from "@/pages/influencer/InfluencerHomePage";
import OnboardingPage from "@/pages/influencer/OnboardingPage";
import InfluencerCampaignsPage from "@/pages/influencer/InfluencerCampaignsPage";
import InfluencerSubscriptionPage from "@/pages/influencer/InfluencerSubscriptionPage";
import InfluencerAnalyticsPage from "@/pages/influencer/InfluencerAnalyticsPage";
import InfluencerProfilePage from "@/pages/influencer/InfluencerProfilePage";
import MessagesPanel from "@/features/messaging/MessagesPanel";

import AdvertiserHomePage from "@/pages/advertiser/AdvertiserHomePage";
import AdvertiserDiscoveryPage from "@/pages/advertiser/AdvertiserDiscoveryPage";
import AdvertiserCampaignsPage from "@/pages/advertiser/AdvertiserCampaignsPage";
import AdvertiserApplicationsPage from "@/pages/advertiser/AdvertiserApplicationsPage";
import AdvertiserBillingPage from "@/pages/advertiser/AdvertiserBillingPage";

import AdminHomePage from "@/pages/admin/AdminHomePage";
import AdminApprovalsPage from "@/pages/admin/AdminApprovalsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

const influencerNav = [
  { to: "/influencer", label: "Overview" },
  { to: "/influencer/campaigns", label: "Campaigns" },
  { to: "/influencer/messages", label: "Messages" },
  { to: "/influencer/subscription", label: "Subscription" },
  { to: "/influencer/analytics", label: "Analytics" },
  { to: "/influencer/profile", label: "Profile" },
  { to: "/influencer/onboarding", label: "Onboarding" },
];

const advertiserNav = [
  { to: "/advertiser", label: "Overview" },
  { to: "/advertiser/discover", label: "Discover" },
  { to: "/advertiser/campaigns", label: "Campaigns" },
  { to: "/advertiser/applications", label: "Applications" },
  { to: "/advertiser/messages", label: "Messages" },
  { to: "/advertiser/billing", label: "Billing" },
];

const adminNav = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/approvals", label: "Approvals" },
  { to: "/admin/users", label: "Users" },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/directory" element={<DirectoryPage />} />
      <Route path="/influencer/:id" element={<InfluencerPublicPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth?mode=signup" replace />} />

      <Route
        path="/influencer"
        element={
          <ProtectedRoute roles={["influencer"]}>
            <DashboardShell title="Influencer" nav={influencerNav} basePath="/influencer" />
          </ProtectedRoute>
        }
      >
        <Route index element={<InfluencerHomePage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="campaigns" element={<InfluencerCampaignsPage />} />
        <Route path="messages" element={<MessagesPanel />} />
        <Route path="subscription" element={<InfluencerSubscriptionPage />} />
        <Route path="analytics" element={<InfluencerAnalyticsPage />} />
        <Route path="profile" element={<InfluencerProfilePage />} />
      </Route>

      <Route
        path="/advertiser"
        element={
          <ProtectedRoute roles={["advertiser"]}>
            <DashboardShell title="Advertiser" nav={advertiserNav} basePath="/advertiser" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdvertiserHomePage />} />
        <Route path="discover" element={<AdvertiserDiscoveryPage />} />
        <Route path="campaigns" element={<AdvertiserCampaignsPage />} />
        <Route path="applications" element={<AdvertiserApplicationsPage />} />
        <Route path="messages" element={<MessagesPanel />} />
        <Route path="billing" element={<AdvertiserBillingPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardShell title="Admin" nav={adminNav} basePath="/admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHomePage />} />
        <Route path="approvals" element={<AdminApprovalsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/influencer" replace />} />
      <Route path="/campaigns" element={<Navigate to="/advertiser/campaigns" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
