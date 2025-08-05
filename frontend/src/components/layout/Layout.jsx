import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Wallet, PieChart, Settings, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "../ui/button";

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transactions", icon: Wallet },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    // { href: "/settings", label: "Settings", icon: Settings }, // Kita bisa tambahkan ini nanti
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex flex-col h-full max-h-screen gap-2">
          {/* Sidebar Header */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <PieChart className="h-6 w-6 text-indigo-600" />
              <span className="">FinTrack</span>
            </Link>
          </div>

          {/* Navigasi Utama */}
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    location.pathname === item.href && "bg-muted text-primary font-bold"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                {user?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.user?.name || "Username"}</p>
                <p className="text-xs text-muted-foreground">{user?.user?.email || "email@example.com"}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1">
        {/* Konten Utama */}
        <main className="flex flex-col flex-1 gap-4 p-4 overflow-auto bg-gray-50 lg:gap-8 lg:p-8">
          <Outlet /> {/* <-- Semua halaman (Dashboard, Transaksi) akan dirender di sini */}
        </main>
      </div>
    </div>
  );
}