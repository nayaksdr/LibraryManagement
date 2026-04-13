import { useEffect, useMemo, useState } from "react";

const API = "https://localhost:44352/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberOption = {
  id: number;
  fullName: string;
  memberCode?: string;
  mobile?: string;
  address?: string;
  isActive?: boolean;
  savedSignature?: string | null;
};

type AttendanceRow = {
  memberId: number;
  fullName: string;
  status: "Present" | "Absent" | "Leave";
  remark: string;
  signatureSnapshot?: string | null;
};

interface MonthlyReport {
  memberName: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}

interface YearlyReport {
  memberName: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}

type Tab = "attendance" | "manage" | "monthly" | "yearly";

// ─── Marathi Months ───────────────────────────────────────────────────────────

const MARATHI_MONTHS = [
  "जानेवारी","फेब्रुवारी","मार्च","एप्रिल",
  "मे","जून","जुलै","ऑगस्ट",
  "सप्टेंबर","ऑक्टोबर","नोव्हेंबर","डिसेंबर",
];

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg">×</button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue:  "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red:   "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <div className={`rounded-2xl border p-4 text-center ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold">{value}</p>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Present: "bg-emerald-50 text-emerald-700",
    Absent:  "bg-red-50 text-red-700",
    Leave:   "bg-amber-50 text-amber-700",
  };

  const label: Record<string, string> = {
    Present: "उपस्थित",
    Absent:  "अनुपस्थित",
    Leave:   "रजा",
  };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {label[status] ?? status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MemberAttendancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("attendance");

  // ── Attendance
  const [date, setDate] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [attLoading, setAttLoading] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);

  // ── CRUD
  const [allMembers, setAllMembers] = useState<MemberOption[]>([]);
  const [mgrLoading, setMgrLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [formData, setFormData] = useState({ fullName: "", memberCode: "", mobile: "", address: "", isActive: true });
  const [formError, setFormError] = useState("");

  // ── Reports
  const [mMonth, setMMonth] = useState("");
  const [mYear, setMYear]   = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData]     = useState<MonthlyReport[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yYear, setYYear]   = useState(new Date().getFullYear().toString());
  const [yearlyData, setYearlyData]       = useState<YearlyReport[]>([]);
  const [yearlyLoading, setYearlyLoading]   = useState(false);

  // ── Load dropdown members
  useEffect(() => {
    fetch(`${API}/members/dropdown`)
      .then(r => r.json())
      .then(setMembers)
      .catch(() => {});
  }, []);

  // ── Load attendance by date
  useEffect(() => {
    if (!date) return;
    const load = async () => {
      setAttLoading(true);
      try {
        const res = await fetch(`${API}/member-attendance/by-date?date=${date}`);
        const data = await res.json();
        setRows(data?.length
          ? data.map((x: AttendanceRow) => ({
              memberId: x.memberId, fullName: x.fullName,
              status: x.status, remark: x.remark || "",
              signatureSnapshot: x.signatureSnapshot || null,
            }))
          : []
        );
      } finally { setAttLoading(false); }
    };
    load();
  }, [date]);

  // ── Selected member signature
  const selected = useMemo(() => members.find(m => m.id === selectedMemberId) || null, [members, selectedMemberId]);
  useEffect(() => { setCurrentSignature(selected?.savedSignature || null); }, [selected]);

  const addMemberToAttendance = () => {
    if (!selected) return;
    if (rows.some(r => r.memberId === selected.id)) return;
    setRows(prev => [...prev, {
      memberId: selected.id, fullName: selected.fullName,
      status: "Present", remark: "",
      signatureSnapshot: selected.savedSignature || null,
    }]);
    setSelectedMemberId(0);
  };

  const updateRow = (memberId: number, field: keyof AttendanceRow, value: string) =>
    setRows(prev => prev.map(r => r.memberId === memberId ? { ...r, [field]: value } : r));

  const removeRow = (memberId: number) =>
    setRows(prev => prev.filter(r => r.memberId !== memberId));

  const saveAttendance = async () => {
    if (!date) { alert("कृपया तारीख निवडा"); return; }
    setAttLoading(true);
    try {
      const res = await fetch(`${API}/member-attendance/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceDate: date,
          items: rows.map(r => ({ memberId: r.memberId, status: r.status, remark: r.remark, signatureSnapshot: r.signatureSnapshot })),
        }),
      });
      if (!res.ok) throw new Error();
      alert("✅ हजेरी यशस्वीरीत्या सेव झाली");
    } catch { alert("सेव करताना त्रुटी आली"); }
    finally { setAttLoading(false); }
  };

  const presentCount = rows.filter(r => r.status === "Present").length;
  const absentCount  = rows.filter(r => r.status === "Absent").length;
  const leaveCount   = rows.filter(r => r.status === "Leave").length;

  // ── CRUD: load all members
  const loadAllMembers = async () => {
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/members`);
      setAllMembers(await res.json());
    } finally { setMgrLoading(false); }
  };

  useEffect(() => { if (activeTab === "manage") loadAllMembers(); }, [activeTab]);

  const openAdd = () => {
    setFormData({ fullName: "", memberCode: "", mobile: "", address: "", isActive: true });
    setFormError(""); setShowAddModal(true);
  };
  const openEdit = (m: MemberOption) => {
    setSelectedMember(m);
    setFormData({ fullName: m.fullName, memberCode: m.memberCode || "", mobile: m.mobile || "", address: m.address || "", isActive: m.isActive ?? true });
    setFormError(""); setShowEditModal(true);
  };
  const openDelete = (m: MemberOption) => { setSelectedMember(m); setShowDeleteModal(true); };

  const handleAdd = async () => {
    if (!formData.fullName.trim()) { setFormError("सदस्याचे पूर्ण नाव आवश्यक आहे"); return; }
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/members`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setShowAddModal(false); await loadAllMembers();
    } catch { setFormError("सेव करताना त्रुटी आली. पुन्हा प्रयत्न करा."); }
    finally { setMgrLoading(false); }
  };

  const handleEdit = async () => {
    if (!formData.fullName.trim() || !selectedMember) { setFormError("सदस्याचे पूर्ण नाव आवश्यक आहे"); return; }
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/members/${selectedMember.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMember.id, ...formData }),
      });
      if (!res.ok) throw new Error();
      setShowEditModal(false); await loadAllMembers();
    } catch { setFormError("अपडेट करताना त्रुटी आली."); }
    finally { setMgrLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    setMgrLoading(true);
    try {
      const res = await fetch(`${API}/members/${selectedMember.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setShowDeleteModal(false); await loadAllMembers();
    } catch { alert("हटवताना त्रुटी आली."); }
    finally { setMgrLoading(false); }
  };

  const loadMonthly = async () => {
    if (!mMonth || !mYear) { alert("महिना आणि वर्ष निवडा"); return; }
    setMonthlyLoading(true);
    try {
      const res = await fetch(`${API}/member-attendance/monthly-report?month=${mMonth}&year=${mYear}`);
      setMonthlyData(await res.json());
    } catch { alert("मासिक अहवाल लोड करताना त्रुटी आली"); }
    finally { setMonthlyLoading(false); }
  };

  const loadYearly = async () => {
    if (!yYear) { alert("वर्ष निवडा"); return; }
    setYearlyLoading(true);
    try {
      const res = await fetch(`${API}/member-attendance/yearly-report?year=${yYear}`);
      setYearlyData(await res.json());
    } catch { alert("वार्षिक अहवाल लोड करताना त्रुटी आली"); }
    finally { setYearlyLoading(false); }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "attendance", label: "हजेरी",          icon: "✅" },
    { id: "manage",     label: "सदस्य",           icon: "👥" },
    { id: "monthly",    label: "मासिक अहवाल",    icon: "📊" },
    { id: "yearly",     label: "वार्षिक अहवाल",  icon: "📅" },
  ];

  // ─── Shared Report Table ──────────────────────────────────────────────────

  const ReportTable = ({ data }: { data: MonthlyReport[] | YearlyReport[] }) => (
    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">अ.क्र.</th>
              <th className="px-5 py-3 text-left">सदस्य</th>
              <th className="px-5 py-3 text-center">उपस्थित</th>
              <th className="px-5 py-3 text-center">अनुपस्थित</th>
              <th className="px-5 py-3 text-center">रजा</th>
              <th className="px-5 py-3 text-center">एकूण</th>
              <th className="px-5 py-3 text-center">टक्केवारी</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-slate-400 text-xs">{i + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
                      {d.memberName.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{d.memberName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">{d.present}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{d.absent}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{d.leave}</span>
                </td>
                <td className="px-5 py-3 text-center text-slate-700 font-medium">{d.total}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.percentage >= 75 ? "bg-emerald-500" : "bg-red-400"}`}
                        style={{ width: `${Math.min(d.percentage, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${d.percentage >= 75 ? "text-emerald-600" : "text-red-500"}`}>
                      {d.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  माहिती उपलब्ध नाही. वर्ष / महिना निवडून "पहा" वर क्लिक करा.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── Form Fields helper ───────────────────────────────────────────────────

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ── Header ── */}
        <div className="rounded-2xl bg-white border border-slate-200 px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">👥</div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">सदस्य हजेरी व्यवस्थापन</h1>
                <p className="text-sm text-slate-500">दैनिक हजेरी, सदस्य नोंदणी आणि अहवाल</p>
              </div>
            </div>
            {activeTab === "attendance" && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="date" value={date}
                  onChange={e => setDate(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={saveAttendance} disabled={attLoading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {attLoading ? "सेव होत आहे…" : "💾 हजेरी सेव करा"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 rounded-xl bg-white border border-slate-200 p-1 shadow-sm overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: हजेरी
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div className="space-y-4">

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="एकूण सदस्य"   value={rows.length}   color="slate" />
              <StatCard label="उपस्थित"       value={presentCount}  color="green" />
              <StatCard label="अनुपस्थित"     value={absentCount}   color="red"   />
              <StatCard label="रजेवर"         value={leaveCount}    color="amber" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">

              {/* Add member panel */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm lg:col-span-1">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">सदस्य जोडा</h2>

                <div className="space-y-3">
                  <select
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    <option value={0}>सदस्य निवडा…</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
                    ))}
                  </select>

                  <button
                    onClick={addMemberToAttendance}
                    disabled={!selectedMemberId}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    + हजेरीत जोडा
                  </button>

                  {/* Signature preview */}
                  <div className="rounded-xl border border-dashed border-slate-300 p-3 mt-1">
                    <p className="text-xs font-medium text-slate-500 mb-2">स्वाक्षरी</p>
                    {currentSignature ? (
                      <img
                        src={currentSignature} alt="स्वाक्षरी"
                        className="h-20 w-full object-contain bg-slate-50 rounded-lg border"
                      />
                    ) : (
                      <div className="h-16 flex items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
                        निवडलेल्या सदस्याची स्वाक्षरी नाही
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  {date && (
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                      <p className="text-xs text-indigo-600 font-medium">
                        📅 {new Date(date).toLocaleDateString("mr-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-xs text-indigo-500 mt-0.5">
                        {rows.length} सदस्य नोंदवले · {presentCount} उपस्थित
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance table */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">आजची हजेरी</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    {date ? new Date(date).toLocaleDateString("mr-IN", { day: "numeric", month: "long", year: "numeric" }) : "तारीख निवडली नाही"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                        <th className="px-4 py-3 text-left rounded-l-xl">सदस्य</th>
                        <th className="px-4 py-3 text-center">स्थिती</th>
                        <th className="px-4 py-3 text-left">शेरा</th>
                        <th className="px-4 py-3 text-center">स्वाक्षरी</th>
                        <th className="px-4 py-3 text-center rounded-r-xl">क्रिया</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr
                          key={row.memberId}
                          className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${i === 0 ? "border-t-0" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
                                {row.fullName.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-900 text-sm">{row.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <select
                              value={row.status}
                              onChange={e => updateRow(row.memberId, "status", e.target.value)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white outline-none cursor-pointer border-0 ${
                                row.status === "Present" ? "bg-emerald-500"
                                : row.status === "Absent" ? "bg-red-500"
                                : "bg-amber-500"
                              }`}
                            >
                              <option value="Present">उपस्थित</option>
                              <option value="Absent">अनुपस्थित</option>
                              <option value="Leave">रजा</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={row.remark}
                              onChange={e => updateRow(row.memberId, "remark", e.target.value)}
                              placeholder="शेरा लिहा…"
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.signatureSnapshot ? (
                              <img src={row.signatureSnapshot} alt="स्वाक्षरी"
                                className="h-10 w-24 object-contain rounded border bg-white mx-auto" />
                            ) : (
                              <span className="text-xs text-slate-400">नाही</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeRow(row.memberId)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                            >
                              काढा
                            </button>
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-3xl">📋</span>
                              <p className="text-sm">अजून कोणताही सदस्य जोडला नाही.</p>
                              <p className="text-xs">डाव्या बाजूने सदस्य निवडा आणि जोडा.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {attLoading && (
                  <div className="mt-3 text-center text-sm text-indigo-600 animate-pulse">लोड होत आहे…</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: सदस्य व्यवस्थापन (CRUD)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "manage" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">सदस्य यादी</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    एकूण {allMembers.length} सदस्य · {allMembers.filter(m => m.isActive ?? true).length} सक्रिय
                  </p>
                </div>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  + नवीन सदस्य जोडा
                </button>
              </div>
            </div>

            {mgrLoading && !allMembers.length ? (
              <div className="rounded-2xl bg-white border border-slate-200 px-5 py-12 text-center text-sm text-slate-400">
                लोड होत आहे…
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {allMembers.map(m => (
                  <div
                    key={m.id}
                    className="group flex items-start justify-between rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-sm font-semibold text-indigo-600">
                        {m.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{m.fullName}</p>
                        {m.memberCode && (
                          <p className="text-xs text-slate-500 mt-0.5">कोड: {m.memberCode}</p>
                        )}
                        {m.mobile && (
                          <p className="text-xs text-slate-500">📞 {m.mobile}</p>
                        )}
                        <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          (m.isActive ?? true) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {(m.isActive ?? true) ? "सक्रिय" : "निष्क्रिय"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(m)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="बदला">
                        ✏️
                      </button>
                      <button onClick={() => openDelete(m)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="हटवा">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {allMembers.length === 0 && (
                  <div className="col-span-3 rounded-2xl bg-white border border-dashed border-slate-300 px-5 py-14 text-center">
                    <p className="text-2xl mb-2">👥</p>
                    <p className="text-sm text-slate-500">अजून कोणताही सदस्य नाही.</p>
                    <p className="text-xs text-slate-400 mt-1">"नवीन सदस्य जोडा" वर क्लिक करा.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: मासिक अहवाल
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "monthly" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">मासिक अहवाल</h2>
                  <p className="text-xs text-slate-500 mt-0.5">सदस्यनिहाय मासिक हजेरी सारांश</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={mMonth} onChange={e => setMMonth(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">महिना निवडा</option>
                    {MARATHI_MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="number" placeholder="वर्ष" value={mYear}
                    onChange={e => setMYear(e.target.value)}
                    className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={loadMonthly} disabled={monthlyLoading}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {monthlyLoading ? "लोड होत आहे…" : "पहा"}
                  </button>
                  <a href={`${API}/member-attendance-report/monthly-excel?month=${mMonth}&year=${mYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    📥 Excel
                  </a>
                  <a href={`${API}/member-attendance-report/monthly-pdf?month=${mMonth}&year=${mYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
                    📄 PDF
                  </a>
                </div>
              </div>
            </div>
            <ReportTable data={monthlyData} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: वार्षिक अहवाल
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "yearly" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">वार्षिक अहवाल</h2>
                  <p className="text-xs text-slate-500 mt-0.5">संपूर्ण वर्षाचा सदस्य हजेरी सारांश</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number" placeholder="वर्ष" value={yYear}
                    onChange={e => setYYear(e.target.value)}
                    className="w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button onClick={loadYearly} disabled={yearlyLoading}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {yearlyLoading ? "लोड होत आहे…" : "पहा"}
                  </button>
                  <a href={`${API}/member-attendance-report/yearly-excel?year=${yYear}`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    📥 Excel
                  </a>
                  <a href={`${API}/member-attendance-report/yearly-pdf?year=${yYear}`}
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

      {/* ════════════════════════════════════════
          MODALS
      ════════════════════════════════════════ */}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="नवीन सदस्य जोडा" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <Field label="पूर्ण नाव" required>
              <input autoFocus value={formData.fullName} placeholder="सदस्याचे पूर्ण नाव"
                onChange={e => { setFormData(p => ({ ...p, fullName: e.target.value })); setFormError(""); }}
                className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="सदस्य कोड">
                <input value={formData.memberCode} placeholder="उदा. LIB001"
                  onChange={e => setFormData(p => ({ ...p, memberCode: e.target.value }))}
                  className={inputCls} />
              </Field>
              <Field label="मोबाईल नंबर">
                <input value={formData.mobile} placeholder="९XXXXXXXXX"
                  onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))}
                  className={inputCls} />
              </Field>
            </div>
            <Field label="पत्ता">
              <textarea value={formData.address} placeholder="पूर्ण पत्ता लिहा…" rows={2}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={inputCls + " resize-none"} />
            </Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="add-active" checked={formData.isActive}
                onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                className="h-4 w-4 rounded accent-indigo-600" />
              <label htmlFor="add-active" className="text-sm text-slate-600">सक्रिय सदस्य</label>
            </div>
            {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                रद्द करा
              </button>
              <button onClick={handleAdd} disabled={mgrLoading}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {mgrLoading ? "सेव होत आहे…" : "जोडा"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <Modal title="सदस्य माहिती बदला" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <Field label="पूर्ण नाव" required>
              <input autoFocus value={formData.fullName}
                onChange={e => { setFormData(p => ({ ...p, fullName: e.target.value })); setFormError(""); }}
                className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="सदस्य कोड">
                <input value={formData.memberCode} placeholder="उदा. LIB001"
                  onChange={e => setFormData(p => ({ ...p, memberCode: e.target.value }))}
                  className={inputCls} />
              </Field>
              <Field label="मोबाईल नंबर">
                <input value={formData.mobile} placeholder="९XXXXXXXXX"
                  onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))}
                  className={inputCls} />
              </Field>
            </div>
            <Field label="पत्ता">
              <textarea value={formData.address} rows={2}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                className={inputCls + " resize-none"} />
            </Field>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="edit-active" checked={formData.isActive}
                onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                className="h-4 w-4 rounded accent-indigo-600" />
              <label htmlFor="edit-active" className="text-sm text-slate-600">सक्रिय सदस्य</label>
            </div>
            {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <button onClick={() => setShowEditModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                रद्द करा
              </button>
              <button onClick={handleEdit} disabled={mgrLoading}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {mgrLoading ? "अपडेट होत आहे…" : "अपडेट करा"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedMember && (
        <Modal title="सदस्य हटवा" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-sm font-semibold text-indigo-600 shrink-0">
                {selectedMember.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{selectedMember.fullName}</p>
                {selectedMember.memberCode && <p className="text-xs text-slate-500">कोड: {selectedMember.memberCode}</p>}
              </div>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-700">
                तुम्हाला खरोखर हा सदस्य हटवायचा आहे का? त्यांची सर्व हजेरी माहिती यापुढे दिसणार नाही.
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