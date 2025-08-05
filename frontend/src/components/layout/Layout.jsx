import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Wallet, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transactions", icon: Wallet },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 p-4 border-r bg-gray-100/40 md:block">
        <h1 className="mb-8 text-2xl font-bold">FinTrack</h1>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-gray-700 transition-all rounded-lg hover:bg-gray-200 hover:text-black",
                location.pathname === item.href && "bg-gray-200 text-black font-semibold"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-white">
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}