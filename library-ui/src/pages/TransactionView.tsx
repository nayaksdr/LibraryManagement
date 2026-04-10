import { useEffect, useState } from "react";
import { History, CheckCircle, Clock, User } from "lucide-react";
import api from "../services/api";

interface Transaction {
  id: number;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
}

export default function TransactionView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get("/transactions").then((res) => setTransactions(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 text-white">
            <History size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">पुस्तक उधारी इतिहास</h1>
            <p className="text-slate-500">सर्व जारी पुस्तके आणि परताव्याची स्थिती नोंद ठेवा.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-6">सदस्य आणि पुस्तक</th>
                <th className="px-8 py-6">जारी दिनांक</th>
                <th className="px-8 py-6">परतावा दिनांक</th>
                <th className="px-8 py-6">स्थिती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800">{t.bookTitle}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <User size={12} /> {t.memberName}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-medium">
                    {new Date(t.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-medium">
                    {new Date(t.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    {t.returnDate ? (
                      <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                        <CheckCircle size={14} /> परतावले
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                        <Clock size={14} /> सक्रिय
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}