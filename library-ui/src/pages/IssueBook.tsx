import { useState, useEffect } from "react";
import { BookOpen, User, ArrowRightLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";


interface Member {
  id: number;
  fullName: string;
}

interface Book {
  id: number;
  title: string;
  availableQuantity: number;
}

export default function IssueBook() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    // Fetch both Books and Members in parallel
    Promise.all([
      api.get("/books"),
      api.get("/members/dropdown")
    ]).then(([booksRes, membersRes]) => {
      setBooks(booksRes.data.filter((b: Book) => b.availableQuantity > 0));
      setMembers(membersRes.data);
    }).catch(() => setStatus({ type: 'error', msg: "Failed to load master data." }));
  }, []);

  const handleIssue = async () => {
    if (!selectedBookId || !selectedMemberId) {
      setStatus({ type: 'error', msg: "कृपया पुस्तक आणि सदस्य दोन्ही निवडा." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Backend expects userId as the query param (matches your controller logic)
      const res = await api.post(`/transactions/issue?bookId=${selectedBookId}&userId=${selectedMemberId}`);
      setStatus({ type: 'success', msg: res.data || "Book issued successfully!" });
      setSelectedBookId("");
      setSelectedMemberId("");
    } catch  {
      setStatus({ type: 'error', msg: "Transaction failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
          <ArrowRightLeft size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-extrabold tracking-tight">पुस्तक देण्याची नोंद</h2>
          <p className="text-blue-100 mt-2">डिजिटल ग्रंथालयासाठी नवीन उधारी नोंद तयार करा.</p>
        </div>

        <div className="p-10 space-y-8">
          {status && (
            <div className={`p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <p className="font-semibold">{status.msg}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Book Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500" /> जारी करण्यासाठी पुस्तक निवडा
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
              >
                <option value="">-- पुस्तके शोधा --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title} ({b.availableQuantity} available)</option>
                ))}
              </select>
            </div>

            {/* Member Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <User size={18} className="text-indigo-500" /> ग्रंथालय सदस्य निवडा
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
              >
                <option value="">-- सदस्याचे नाव निवडा --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName} (ID: {m.id})</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleIssue}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              loading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft />}
            {loading ? "प्रक्रिया सुरू आहे..." : "जारी प्रक्रिया निश्चित करा"}
          </button>
        </div>
      </div>
    </div>
  );
}