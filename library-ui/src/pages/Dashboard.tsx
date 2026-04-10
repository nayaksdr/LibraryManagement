import Navbar from "../components/Navbar";
import Charts from "../components/Charts";
import { Book, Users, ArrowRightLeft, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

interface BookData {
  id: number;
  title: string;
  availableQuantity: number;
}

interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  availableBooks: number;
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    availableBooks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [books, members, transactions] = await Promise.all([
          api.get<BookData[]>("/books"),
          api.get("/members"),
          api.get("/transactions/active")
        ]);

        const totalAvailable = books.data.reduce(
          (acc: number, b: BookData) => acc + b.availableQuantity,
          0
        );

        setStats({
          totalBooks: books.data.length,
          totalMembers: members.data.length,
          activeLoans: transactions.data.length,
          availableBooks: totalAvailable
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error loading dashboard stats:", err.message);
        }
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ✅ Navbar only */}
      <Navbar />

      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800">ग्रंथालय आढावा</h1>
          <p className="text-slate-500 font-medium">तात्काळ प्रणाली निरीक्षण</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Book className="text-blue-600" />} label="एकूण पुस्तके" value={stats.totalBooks} color="bg-blue-50" />
          <StatCard icon={<Users className="text-indigo-600" />} label="एकूण सभासद" value={stats.totalMembers} color="bg-indigo-50" />
          <StatCard icon={<ArrowRightLeft className="text-amber-600" />} label="सक्रिय ऋण" value={stats.activeLoans} color="bg-amber-50" />
          <StatCard icon={<CheckCircle className="text-emerald-600" />} label="उपलब्ध स्टॉक" value={stats.availableBooks} color="bg-emerald-50" />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">साठा विश्लेषण प्रणाली</h2>
          <Charts stats={stats} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105">
      <div className={`${color} p-4 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      </div>
    </div>
  );
}