import { useEffect, useState } from "react";
import { Undo2, Search, User, Book as BookIcon, Loader2, CheckCircle } from "lucide-react";
import api from "../services/api";

interface ActiveTransaction {
  id: number;
  bookTitle: string;
  memberName: string;
  issueDate: string;
}

export default function ReturnBook() {
  const [activeLoans, setActiveLoans] = useState<ActiveTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchActiveLoans = async () => {
    try {
      const res = await api.get("/transactions/active");
      setActiveLoans(res.data);
    } catch {
      console.error("Failed to load active loans");
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const handleReturn = async (id: number) => {
    setLoadingId(id);
    setMessage(null);
    try {
      const res = await api.post(`/transactions/return?transactionId=${id}`);
      setMessage({ type: 'success', text: res.data || "Book returned successfully!" });
      // Refresh the list to remove the returned item
      fetchActiveLoans();
    } catch  {
      setMessage({ type: 'error', text: "Failed to process return." });
    } finally {
      setLoadingId(null);
    }
  };

  const filteredLoans = activeLoans.filter(l => 
    l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Undo2 className="text-blue-600" size={32} /> परत करण्याची प्रक्रिया
            </h1>
            <p className="text-slate-500 mt-1">नवीन येणारी पुस्तके व्यवस्थापित करून साठा अपडेट करा.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="सदस्य किंवा पुस्तक शोधा..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <CheckCircle size={20} />
            <p className="font-bold">{message.text}</p>
          </div>
        )}

        {/* Active Loans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.length > 0 ? (
            filteredLoans.map((loan) => (
              <div key={loan.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookIcon size={24} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                    ID: {loan.id}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{loan.bookTitle}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <User size={14} />
                  <span>{loan.memberName}</span>
                </div>

                <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <p>जारी दिनांक</p>
                    <p className="font-bold text-slate-600">{new Date(loan.issueDate).toLocaleDateString()}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleReturn(loan.id)}
                    disabled={loadingId === loan.id}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingId === loan.id ? <Loader2 className="animate-spin" size={16} /> : <Undo2 size={16} />}
                    परत स्वीकारा
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">आपल्या शोधानुसार कोणतीही सक्रिय उधारी आढळली नाही.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}