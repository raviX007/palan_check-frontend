import { QuickCheck } from "@/components/marketing/QuickCheck";
import { SectionHeading, SHELL } from "@/components/marketing/shared";

export const metadata = {
  title: "Quick compliance check — RegulationCheck",
  description:
    "Pick a sample question and get the general rule, with the exact sections it comes from.",
};

export default function QuickCheckPage() {
  return (
    <section style={{ ...SHELL, paddingTop: 64, paddingBottom: 96 }}>
      <SectionHeading
        kicker="Quick check"
        title="Check your compliance in 30 seconds"
        lead="Pick a sample question below. No sign-up required, no LLM cost. Just a quick read on where you stand."
      />
      <QuickCheck />
    </section>
  );
}
