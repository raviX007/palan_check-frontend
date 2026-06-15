import { Sidebar } from "@/components/app/Sidebar";
import { TopBar } from "@/components/app/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: "224px", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <main style={{ flex: 1, padding: "24px 28px", background: "var(--s50)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
