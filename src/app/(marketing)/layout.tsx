import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
