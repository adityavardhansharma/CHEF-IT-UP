import { GTNavbar } from "@/components/landing/gt-navbar";
import { GrandTour } from "@/components/landing/grand-tour";
import { GTFooter } from "@/components/landing/gt-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#0F1E33] overflow-x-hidden">
      <GTNavbar />
      <main>
        <GrandTour />
      </main>
      <GTFooter />
    </div>
  );
}
