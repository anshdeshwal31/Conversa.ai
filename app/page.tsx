import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HeroSection from "./components/landing/HeroSection";
import FeaturesSection from "./components/landing/FeaturesSection";
import IntegrationsSection from "./components/landing/IntegrationsSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import StatsSection from "./components/landing/StatsSection";
import MoreFeaturesSection from "./components/landing/MoreFeaturesSection";
import CTASection from "./components/landing/CTASection";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen space-y-1 pb-2">
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <HowItWorksSection />
      <StatsSection />
      <MoreFeaturesSection />
      <CTASection />
    </div>
  );
}
