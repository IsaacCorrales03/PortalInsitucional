import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ToastProvider } from "@/lib/Toast";
import "./dashboard.css";

export const metadata = { title: "Dashboard — CTP Pavas" };

export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <div className="db-shell">
        <DashboardSidebar />
        <div className="db-main">{children}</div>
      </div>
    </ToastProvider>

  );
}