// app/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import AdvisorCarousel from "@/components/home/AdvisorCarousel";
import CategoryPills from "@/components/home/CategoryPills";
import CuratedGuides from "@/components/home/CuratedGuides";
import ComparisonTable from "@/components/home/ComparisonTable";
import PerksList from "@/components/home/PerksList";
import HowItWorks from "@/components/home/HowItWorks";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AdvisorCarousel />
        <CategoryPills />
        <CuratedGuides />
        <ComparisonTable />
        <PerksList />
        <HowItWorks />
        <ReviewsCarousel />
      </main>
      <Footer />
    </>
  );
}
