import { useEffect, useState } from "react";
import { Users, UserPlus, Edit3, Trash2, Search, X, Loader2, CheckCircle } from "lucide-react";
import api from "../services/api";
import axios, { AxiosError } from "axios";

interface Member {
  id: number;
  fullName: string;
  email: string;
  address: string;
  phone: string;        // ✅ renamed from phoneNumber → phone
  isActive: boolean;
}

interface MemberForm {
  fullName: string;
  email: string;
  phone: string;        // ✅ renamed from phoneNumber → phone
  address: string;
  password: string;
  isActive: boolean;
}

const emptyForm: MemberForm = {
  fullName: "",
  email: "",
  phone: "",            // ✅ renamed
  address: "",
  password: "",
  isActive: true,
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MemberForm>(emptyForm);

  const fetchMembers = async () => {
    const res = await api.get<Member[]>("/members");
    setMembers(res.data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, unknown> = {
      FullName: formData.fullName,
      Email: formData.email,
      Phone: formData.phone,        // ✅ was PhoneNumber, now Phone
      Address: formData.address,
      IsActive: formData.isActive,
    };

    if (!editingMember || formData.password) {
      payload.Password = formData.password;
    }

    try {
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, payload);
      } else {
        await api.post("/members", payload);
      }

      setIsModalOpen(false);
      setEditingMember(null);
      setFormData(emptyForm);
      fetchMembers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ errors: Record<string, string[]>; title?: string }>;
        const errors = axiosError.response?.data?.errors;
        if (errors) {
          const messages = Object.entries(errors)
            .map(([field, msgs]) => `• ${field}: ${msgs.join(", ")}`)
            .join("\n");
          alert(`Validation Errors:\n${messages}`);
        } else {
          alert(axiosError.response?.data?.title ?? "Request failed. Please try again.");
        }
        console.error("VALIDATION ERRORS:", errors);
      } else {
        console.error("Unexpected error:", err);
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      await api.delete(`/members/${id}`);
      fetchMembers();
    }
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,          // ✅ renamed
      address: member.address,
      password: "",
      isActive: member.isActive,
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">ग्रंथालय सदस्य</h1>
              <p className="text-slate-500">सदस्य प्रोफाइल आणि संपर्क तपशील व्यवस्थापित करा</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <UserPlus size={20} /> नवीन सदस्य जोडा
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">पूर्ण नाव</th>
                <th className="px-8 py-5">संपर्क माहिती</th>
                <th className="px-8 py-5">स्थिती</th>
                <th className="px-8 py-5 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-800">{member.fullName}</td>
                  <td className="px-8 py-6 text-sm text-slate-600">
                    <div className="font-medium">{member.email}</div>
                    <div className="text-slate-400">{member.phone}</div>         {/* ✅ renamed */}
                    <div className="text-slate-400 text-xs">{member.address}</div> {/* ✅ added */}
                  </td>
                  <td className="px-8 py-6">
                    {member.isActive ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> सक्रिय
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black w-fit">निष्क्रिय</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(member)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800">{editingMember ? "Edit Member" : "New Member"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              {/* ✅ Scrollable form so all fields visible on small screens */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">पूर्ण नाव</label>
                  <input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Ram Rathod"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">ईमेल पत्ता</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ram@gmail.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">फोन नंबर</label>
                  <input
                    required
                    value={formData.phone}                                               // ✅ renamed
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} // ✅ renamed
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 0000000000"
                  />
                </div>

                {/* ✅ Address field — was missing from form entirely */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">पत्ता</label>
                  <input
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 123 Main Street, Pune"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    पासवर्ड{" "}
                    {editingMember && (
                      <span className="text-slate-400 normal-case font-normal">(leave blank to keep current)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingMember}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                    id="active"
                  />
                  <label htmlFor="active" className="text-sm font-bold text-slate-700">खाते सक्रिय करा</label>
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" /> : editingMember ? "प्रोफाइल अपडेट करा" : "नवीन सदस्य तयार करा"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}