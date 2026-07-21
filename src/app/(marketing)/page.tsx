import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { Features } from "@/components/marketing/Features";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { Architecture } from "@/components/marketing/Architecture";
import { Pricing } from "@/components/marketing/Pricing";
import { Coverage } from "@/components/marketing/Coverage";
import { QuickCheck } from "@/components/marketing/QuickCheck";
import { SectionHeading, SHELL, SECTION_GAP } from "@/components/marketing/shared";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProblemSection />
      <Features />
      <InteractiveDemo />
      <Architecture />
      <Pricing />
      <Coverage />

      <section
        id="quick-check"
        style={{ ...SHELL, marginTop: SECTION_GAP, paddingBottom: SECTION_GAP }}
      >
        <SectionHeading
          title="Check your compliance in 30 seconds"
          lead="Pick a sample question below. No sign-up required, no LLM cost. Just a quick read on where you stand."
        />
        <QuickCheck />
      </section>
    </>
  );
}
