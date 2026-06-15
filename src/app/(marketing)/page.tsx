import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { TrustBar } from "@/components/marketing/TrustBar";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { Features } from "@/components/marketing/Features";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { Architecture } from "@/components/marketing/Architecture";
import { Pricing } from "@/components/marketing/Pricing";

function Jurisdictions() {
  return (
    <section className="jurisdictions">
      <div className="jurisdictions-inner">
        <div className="jurisdictions-header">
          <div className="section-label">Coverage</div>
          <div className="section-title">India + EU regulatory frameworks</div>
        </div>
        <div className="jurisdiction-grid">
          <div className="jurisdiction-card india">
            <div className="jurisdiction-flag">🇮🇳</div>
            <div className="jurisdiction-name">India</div>
            <div className="jurisdiction-subtitle">Data protection + labour compliance</div>
            <div className="jurisdiction-regs">
              {["Digital Personal Data Protection Act 2023","DPDP Rules 2025 (notified Nov 14)","Code on Wages 2019","Industrial Relations Code 2020","Social Security Code 2020","OSH Code 2020"].map((r) => (
                <div key={r} className="jurisdiction-reg">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  {r}
                </div>
              ))}
            </div>
          </div>
          <div className="jurisdiction-card eu">
            <div className="jurisdiction-flag">🇪🇺</div>
            <div className="jurisdiction-name">European Union</div>
            <div className="jurisdiction-subtitle">Data protection + AI regulation</div>
            <div className="jurisdiction-regs">
              {["General Data Protection Regulation (GDPR)","EU AI Act 2024","EDPB Guidelines"].map((r) => (
                <div key={r} className="jurisdiction-reg">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta">
      <div className="cta-inner">
        <h2>Check your compliance in 30 seconds</h2>
        <p>
          Answer 5 questions. Get an instant compliance snapshot. No sign-up required,
          no LLM cost — just a quick assessment of where you stand.
        </p>
        <div className="cta-buttons">
          <Link href="/quick-check" className="btn btn-primary">Start Quick Check</Link>
          <Link href="/sign-in" className="btn btn-ghost">Sign In with Demo Account</Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProblemSection />
      <Features />
      <InteractiveDemo />
      <Architecture />
      <Pricing />
      <Jurisdictions />
      <CTA />
    </>
  );
}
