import { useEffect, useRef, useState } from "react";

const API = "https://localhost:44352/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Newspaper {
  id: number;
  name: string;
  isActive?: boolean;
}

interface AttendanceRow {
  id: number;
  name: string;
  status: "Present" | "Absent";
  remark: string;
}

interface MonthlyReport {
  memberName: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

interface YearlyReport {
  memberName: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

type Tab = "attendance" | "manage" | "monthly" | "yearly";

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ value, color }: { value: number | string; color: string }) {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700",
    red:   "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>
      {value}
    </span>
  );
}

// ─── Marathi Months ───────────────────────────────────────────────────────────

const MARATHI_MONTHS = [
  "जानेवारी","फेब्रुवारी","मार्च","एप्रिल",
  "मे","जून","जुलै","ऑगस्ट",
  "सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewspaperAttendance() {
  const [activeTab, setActiveTab] = useState<Tab>("attendance");

  // Attendance
  const [date, setDate] = useState("");
  const [papers, setPapers] = useState<AttendanceRow[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const hasFetchedAtt = useRef(false);

  // Manage CRUD
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [mgrLoading, setMgrLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Newspaper | null>(null);
  const [formName, setFormName] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [mgrError, setMgrError] = useState("");

  // Monthly
  const [mMonth, setMMonth] = useState("");
  const [mYear, setMYear] = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Yearly
  const [yYear, setYYear] = useState(new Date().getFullYear().toString());
  const [yearlyData, setYearlyData] = useState<YearlyReport[]>([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  // ── Load newspapers on mount
  useEffect(() => {
    fetch(`${API}/newspaperattendance/newspapers`)
      .then(r => r.json())
      .then((data: Newspaper[]) =>
        setPapers(data.map(p => ({ id: p.id, name: p.name, status: "Present", remark: "" })))
      )
      .catch(() => {});
  }, []);

  // ── Load attendance by date
  useEffect(() => {
    if (!date || hasFetchedAtt.current) return;
    hasFetchedAtt.current = true;
    const load = async () => {
      setAttLoading(true);
      try {
        const res = await fetch(`${API}/newspaperattendance/by-date?date=${date}`);
        setPapers(await res.json());
      } finally { setAttLoading(false); }
    };
    load();
  }, [date]);

  const handleAttChange = (id: number, field: keyof AttendanceRow, value: string) =>
    setPapers(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));

  const saveAttendance = async () => {
    if (!date) { alert("कृपया तारीख निवडा"); return; }
    setAttLoading(true);
    try {
      await fetch(`${API}/newspaperattendance/save?date=${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(papers.map(p => ({ newspaperId: p.id, status: p.status, remark: p.remark }))),
      });
      alert("✅ हजेरी यशस्वीरीत्या सेव झाली");
    } finally { setAttLoading(false); }
  };

  const presentCount = papers.filter(p => p.status === "Present").length;
  const absentCount  = papers.filter(p => p.status === "Absent").length;

  // ── Load CRUD newspapers
  const loadNewspapers = async () => {
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/newspapers`);
      setNewspapers(await res.json());
    } finally { setMgrLoading(false); }
  };

  useEffect(() => { if (activeTab === "manage") loadNewspapers(); }, [activeTab]);

  const openAdd    = () => { setFormName(""); setFormActive(true); setMgrError(""); setShowAddModal(true); };
  const openEdit   = (p: Newspaper) => { setSelectedPaper(p); setFormName(p.name); setFormActive(p.isActive ?? true); setMgrError(""); setShowEditModal(true); };
  const openDelete = (p: Newspaper) => { setSelectedPaper(p); setShowDeleteModal(true); };

  const handleAdd = async () => {
    if (!formName.trim()) { setMgrError("वृत्तपत्राचे नाव आवश्यक आहे"); return; }
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/newspapers`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), isActive: formActive }),
      });
      if (!res.ok) throw new Error();
      setShowAddModal(false); await loadNewspapers();
    } catch { setMgrError("सेव करताना त्रुटी आली."); }
    finally { setMgrLoading(false); }
  };

  const handleEdit = async () => {
    if (!formName.trim() || !selectedPaper) { setMgrError("वृत्तपत्राचे नाव आवश्यक आहे"); return; }
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/newspapers/${selectedPaper.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedPaper.id, name: formName.trim(), isActive: formActive }),
      });
      if (!res.ok) throw new Error();
      setShowEditModal(false); await loadNewspapers();
    } catch { setMgrError("अपडेट करताना त्रुटी आली."); }
    finally { setMgrLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedPaper) return;
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/newspapers/${selectedPaper.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setShowDeleteModal(false); await loadNewspapers();
    } catch { alert("हटवताना त्रुटी आली."); }
    finally { setMgrLoading(false); }
  };

  const loadMonthly = async () => {
    if (!mMonth || !mYear) { alert("महिना आणि वर्ष निवडा"); return; }
    setMonthlyLoading(true);
    try {
      const res = await fetch(`${API}/newspaper-attendance-report/monthly-report?month=${mMonth}&year=${mYear}`);
      setMonthlyData(await res.json());
    } catch { alert("मासिक अहवाल लोड करताना त्रुटी आली"); }
    finally { setMonthlyLoading(false); }
  };

  const loadYearly = async () => {
    if (!yYear) { alert("वर्ष निवडा"); return; }
    setYearlyLoading(true);
    try {
      const res = await fetch(`${API}/newspaper-attendance-report/yearly-report?year=${yYear}`);
      setYearlyData(await res.json());
    } catch { alert("वार्षिक अहवाल लोड करताना त्रुटी आली"); }
    finally { setYearlyLoading(false); }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "attendance", label: "हजेरी",         icon: "📰" },
    { id: "manage",     label: "व्यवस्थापन",    icon: "📋" },
    { id: "monthly",    label: "मासिक अहवाल",   icon: "📊" },
    { id: "yearly",     label: "वार्षिक अहवाल", icon: "📅" },
  ];

  // ─── Report table shared ──────────────────────────────────────────────────

  const ReportTable = ({ data }: { data: MonthlyReport[] | YearlyReport[] }) => (
    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <th className="px-5 py-3 text-left">अ.क्र.</th>
              <th className="px-5 py-3 text-left">वृत्तपत्र</th>
              <th className="px-5 py-3 text-center">उपस्थित</th>
              <th className="px-5 py-3 text-center">अनुपस्थित</th>
              <th className="px-5 py-3 text-center">एकूण</th>
              <th className="px-5 py-3 text-center">टक्केवारी</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{d.memberName}</td>
                <td className="px-5 py-3 text-center"><Badge value={d.present} color="green" /></td>
                <td className="px-5 py-3 text-center"><Badge value={d.absent} color="red" /></td>
                <td className="px-5 py-3 text-center text-slate-700">{d.total}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`font-semibold ${d.percentage >= 75 ? "text-emerald-600" : "text-red-500"}`}>
                    {d.percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                  माहिती उपलब्ध नाही. वर्ष / महिना निवडून "पहा" वर क्लिक करा.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* Header */}
        <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">📰</div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">वृत्तपत्र व्यवस्थापन</h1>
              <p className="text-sm text-slate-500">हजेरी नोंद, अहवाल आणि वृत्तपत्र यादी</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-white border border-slate-200 p-1 shadow-sm overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── हजेरी ── */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-slate-800">दैनिक हजेरी</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="date"
                    value={date}
                    onChange={e => { hasFetchedAtt.current = false; setDate(e.target.value); }}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={saveAttendance}
                    disabled={attLoading}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {attLoading ? "सेव होत आहे…" : "💾 हजेरी सेव करा"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "एकूण",       value: papers.length, cls: "bg-slate-50 text-slate-700" },
                { label: "उपस्थित",   value: presentCount,  cls: "bg-emerald-50 text-emerald-700" },
                { label: "अनुपस्थित", value: absentCount,   cls: "bg-red-50 text-red-700" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl border border-slate-200 p-4 text-center ${s.cls}`}>
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                  <p className="mt-1 text-2xl font-semibold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                      <th className="px-5 py-3 text-left">अ.क्र.</th>
                      <th className="px-5 py-3 text-left">वृत्तपत्र</th>
                      <th className="px-5 py-3 text-center">स्थिती</th>
                      <th className="px-5 py-3 text-left">शेरा</th>
                    </tr>
                  </thead>
                  <tbody>
                    {papers.map((p, i) => (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                        <td className="px-5 py-3 text-center">
                          <select
                            value={p.status}
                            onChange={e => handleAttChange(p.id, "status", e.target.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white outline-none cursor-pointer ${
                              p.status === "Present" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          >
                            <option value="Present">उपस्थित</option>
                            <option value="Absent">अनुपस्थित</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            value={p.remark}
                            onChange={e => handleAttChange(p.id, "remark", e.target.value)}
                            placeholder="कारण लिहा…"
                            className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                    {papers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                          कोणतेही वृत्तपत्र सापडले नाही. व्यवस्थापन टॅबमधून जोडा.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {attLoading && (
                <div className="border-t border-slate-100 px-5 py-3 text-center text-sm text-blue-600">
                  लोड होत आहे…
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── व्यवस्थापन ── */}
        {activeTab === "manage" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">वृत्तपत्र यादी</h2>
                  <p className="text-xs text-slate-500 mt-0.5">वृत्तपत्र जोडा, बदला किंवा हटवा</p>
                </div>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + वृत्तपत्र जोडा
                </button>
              </div>
            </div>

            {mgrLoading && !newspapers.length ? (
              <div className="rounded-2xl bg-white border border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
                लोड होत आहे…
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {newspapers.map(np => (
                  <div
                    key={np.id}
                    className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-600">
                        {np.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 text-sm">{np.name}</p>
                        <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          (np.isActive ?? true) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {(np.isActive ?? true) ? "सक्रिय" : "निष्क्रिय"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex shrink-0 gap-1">
                      <button onClick={() => openEdit(np)} title="बदला"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">✏️</button>
                      <button onClick={() => openDelete(np)} title="हटवा"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
                {newspapers.length === 0 && (
                  <div className="col-span-3 rounded-2xl bg-white border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-400">
                    अजून कोणतेही वृत्तपत्र नाही. "वृत्तपत्र जोडा" वर क्लिक करा.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── मासिक अहवाल ── */}
        {activeTab === "monthly" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">मासिक अहवाल</h2>
                  <p className="text-xs text-slate-500 mt-0.5">वृत्तपत्रनिहाय मासिक हजेरी सारांश</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={mMonth}
                    onChange={e => setMMonth(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">महिना निवडा</option>
                    {MARATHI_MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number" placeholder="वर्ष" value={mYear}
                    onChange={e => setMYear(e.target.value)}
                    className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={loadMonthly} disabled={monthlyLoading}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                    {monthlyLoading ? "लोड होत आहे…" : "पहा"}
                  </button>
                  <a href={`${API}/newspaper-attendance-report/monthly-excel?month=${mMonth}&year=${mYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    📥 Excel
                  </a>
                  <a href={`${API}/newspaper-attendance-report/monthly-pdf?month=${mMonth}&year=${mYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
                    📄 PDF
                  </a>
                </div>
              </div>
            </div>
            <ReportTable data={monthlyData} />
          </div>
        )}

        {/* ── वार्षिक अहवाल ── */}
        {activeTab === "yearly" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">वार्षिक अहवाल</h2>
                  <p className="text-xs text-slate-500 mt-0.5">संपूर्ण वर्षाचा वृत्तपत्र हजेरी सारांश</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number" placeholder="वर्ष" value={yYear}
                    onChange={e => setYYear(e.target.value)}
                    className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={loadYearly} disabled={yearlyLoading}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                    {yearlyLoading ? "लोड होत आहे…" : "पहा"}
                  </button>
                  <a href={`${API}/newspaper-attendance-report/yearly-excel?year=${yYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    📥 Excel
                  </a>
                  <a href={`${API}/newspaper-attendance-report/yearly-pdf?year=${yYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
                    📄 PDF
                  </a>
                </div>
              </div>
            </div>
            <ReportTable data={yearlyData} />
          </div>
        )}

      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <Modal title="नवीन वृत्तपत्र जोडा" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                वृत्तपत्राचे नाव <span className="text-red-500">*</span>
              </label>
              <input autoFocus value={formName}
                onChange={e => { setFormName(e.target.value); setMgrError(""); }}
                placeholder="उदा. लोकमत, सकाळ, महाराष्ट्र टाइम्स"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="add-active" checked={formActive}
                onChange={e => setFormActive(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600" />
              <label htmlFor="add-active" className="text-sm text-slate-600">सक्रिय</label>
            </div>
            {mgrError && <p className="text-xs text-red-500">{mgrError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                रद्द करा
              </button>
              <button onClick={handleAdd} disabled={mgrLoading}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {mgrLoading ? "सेव होत आहे…" : "जोडा"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selectedPaper && (
        <Modal title="वृत्तपत्र बदला" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                वृत्तपत्राचे नाव <span className="text-red-500">*</span>
              </label>
              <input autoFocus value={formName}
                onChange={e => { setFormName(e.target.value); setMgrError(""); }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="edit-active" checked={formActive}
                onChange={e => setFormActive(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600" />
              <label htmlFor="edit-active" className="text-sm text-slate-600">सक्रिय</label>
            </div>
            {mgrError && <p className="text-xs text-red-500">{mgrError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowEditModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                रद्द करा
              </button>
              <button onClick={handleEdit} disabled={mgrLoading}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {mgrLoading ? "अपडेट होत आहे…" : "अपडेट करा"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && selectedPaper && (
        <Modal title="वृत्तपत्र हटवा" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-5">
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-700">
                तुम्हाला खरोखर{" "}
                <span className="font-semibold">"{selectedPaper.name}"</span>{" "}
                हे वृत्तपत्र हटवायचे आहे का? ही क्रिया पूर्वत करता येणार नाही.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                रद्द करा
              </button>
              <button onClick={handleDelete} disabled={mgrLoading}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
                {mgrLoading ? "हटवत आहे…" : "हटवा"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}