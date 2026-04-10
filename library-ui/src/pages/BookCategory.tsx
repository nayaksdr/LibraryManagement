import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
}

export default function BookCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ FIXED FETCH (SAFE)
  const fetchCategories = async () => {
    try {
      const res = await api.get("/BookCategory");
      console.log("Categories API:", res.data);

      // safety check
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch {
      console.error("Fetch Error:");
      setCategories([]); // prevent crash
    }
  };

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await api.get("/BookCategory");

      console.log("API:", res.data); // 👈 debug

      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch  {
      console.error("ERROR:");
      setCategories([]); // ✅ prevents crash
    }
  };

  loadCategories();
}, []);

  // ➕ Add / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Category name required");
      return;
    }

    try {
      if (editing) {
        await api.put(`/BookCategory/${editing.id}`, {
          id: editing.id,
          name,
        });
      } else {
        await api.post("/BookCategory", { name });
      }

      setName("");
      setEditing(null);
      setIsModalOpen(false);
      fetchCategories();
    } catch  {
      console.error("Save Error:");
      alert("Error saving category");
    }
  };

  // ❌ Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    try {
      await api.delete(`/BookCategory/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ✏️ Edit
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setIsModalOpen(true);
  };

  return (
  <div className="min-h-screen bg-gray-50 p-6">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          📚 पुस्तक श्रेणी
        </h1>
        <p className="text-gray-500">सर्व पुस्तक श्रेणी येथे व्यवस्थापित करा</p>
      </div>

      <button
        onClick={openAdd}
        className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
      >
        <Plus /> नवीन श्रेणी
      </button>
    </div>

    {/* STATS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-gray-500">एकूण श्रेणी</p>
        <h2 className="text-2xl font-bold">{categories.length}</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-gray-500">या सत्रात जोडल्या</p>
        <h2 className="text-2xl font-bold">0</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="text-gray-500">शेवटचे अपडेट</p>
        <h2 className="text-lg font-semibold">
          {new Date().toLocaleTimeString()}
        </h2>
      </div>
    </div>

    {/* SEARCH */}
    <div className="mb-4">
      <input
        type="text"
        placeholder="🔍 श्रेणी शोधा..."
        className="w-full border rounded-lg px-4 py-2"
      />
    </div>

    {/* TABLE */}
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-sm">
            <th className="p-3">क्र.</th>
            <th className="p-3">श्रेणीचे नाव</th>
            <th className="p-3 text-right">क्रिया</th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center p-4 text-gray-500">
                कोणतीही श्रेणी सापडली नाही
              </td>
            </tr>
          ) : (
            categories.map((c, index) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{String(index + 1).padStart(2, "0")}</td>

                <td className="p-3 font-medium">{c.name}</td>

                <td className="p-3 flex justify-end gap-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-blue-600 hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* MODAL */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
        <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {editing ? "श्रेणी संपादित करा" : "नवीन श्रेणी जोडा"}
            </h2>
            <button onClick={() => setIsModalOpen(false)}>
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="श्रेणीचे नाव"
              className="w-full border px-3 py-2 rounded-lg"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {editing ? "अपडेट करा" : "सेव्ह करा"}
            </button>

          </form>
        </div>
      </div>
    )}
  </div>
);
}