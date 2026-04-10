import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, BookOpen, Search, X } from "lucide-react";
import api from "../services/api";

interface Category {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  categoryId: number; // Added
  quantity : number; // Added
  availableQuantity: number;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [categories, setCategories] = useState<Category[]>([]);
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  // ── inside Books() component ──────────────────────────────────

  

  const [formData, setFormData] = useState({ 
  title: "", 
  author: "", 
    categoryId: 0, 
  quantity: 0, 
  availableQuantity: 0 

});

 const fetchBooks = async () => {
  try {
    const res = await api.get("/books");
    setBooks(res.data);
  } catch (err) {
    console.error("Books API Error:", err);
  }
};

const fetchCategories = async () => {
  try {
    const res = await api.get("/BookCategory");
    console.log("Categories:", res.data); // 👈 debug
    setCategories(res.data);
  } catch (err) {
    console.error("Category API Error:", err);
  }
};
 useEffect(() => {
  const loadData = async () => {
    await fetchBooks();
    await fetchCategories();
  };

  loadData();
}, []);
 

// ── Auto-open camera when modal opens for new book ────────────
const openModal = (book: Book | null = null) => {
  if (book) {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author,
                  categoryId: book.categoryId, quantity: book.quantity,
                  availableQuantity: book.availableQuantity });
   
  } else {
    setEditingBook(null);
    setFormData({ title: "", author: "", categoryId: 0, quantity: 0, availableQuantity: 0 });
  
  }
  setIsModalOpen(true);
};
  // Handle Delete
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await api.delete(`/books/${id}`);
        setBooks(books.filter((b) => b.id !== id)); // Optimistic UI update
      } catch {
        alert("Error deleting book.");
      }
    }
  };
  

  // Handle Submit (Create or Update)
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const payload = {
    title: formData.title,
    author: formData.author,
      categoryId: formData.categoryId,// Added
    quantity: Number(formData.quantity), // Added
    availableQuantity: Number(formData.availableQuantity)
    
  };

  try {
    if (editingBook) {
      await api.put(`/books/${editingBook.id}`, { id: editingBook.id, ...payload });
    } else {
      await api.post("/books", payload);
    }
    setIsModalOpen(false);
    fetchBooks();
  } catch  {    
    alert("Check console for specific field errors!");
  }
};



  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">

      {/* 📘 Book Icon */}
      <BookOpen className="text-blue-600 w-8 h-8" />

      {/* 🖼️ Mahatma Phule Small Icon */}
      <img
        src="/MJPhule.jpg"   // 👉 place image in public folder
        alt="Mahatma Phule"
        className="w-20 h-20 rounded-full object-cover border"
      />

      {/* 📚 Library Name */}
      <span className="leading-tight">
        महात्मा फुले सार्वजनिक वाचनालय <br />
        <span className="text-sm font-medium text-gray-600">
          दहीफळ (भो.) तांडा, परतूर, जालना
        </span>
      </span>
    </h1>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
        >
          <Plus size={20} /> नवीन नोंदणी करा
        </button>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">वेगवेगळी पुस्तक शीर्षके</p>
          <h3 className="text-2xl font-bold">{books.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">उपलब्ध साठा</p>
          <h3 className="text-2xl font-bold text-blue-600">
            {books.reduce((acc, b) => acc + b.availableQuantity, 0)} Units
          </h3>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/50 flex items-center gap-3 border-b">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search catalog..."
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                <th className="px-6 py-4">शीर्षक</th>
                <th className="px-6 py-4">लेखक</th>
                <th className="px-6 py-4 text-center">स्थिती</th>
                <th className="px-6 py-4 text-right">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800">{b.title}</td>
                  <td className="px-6 py-4 text-slate-600">{b.author}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.availableQuantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {b.availableQuantity > 0 ? `${b.availableQuantity} Available` : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => openModal(b)} className="text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => handleDelete(b.id)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {/* --- ADD/EDIT MODAL --- */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="p-6 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">{editingBook ? "पुस्तक संपादित करा" : "नवीन पुस्तक जोडा"}</h2>
        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">पुस्तक शीर्षक</label>
          <input 
            required
            type="text" 
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">लेखकाचे नाव</label>
          <input 
            required
            type="text" 
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
          />
        </div>
        {/* ── Camera / Scan Section ── */}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">प्रकार</label>
          
<select
  required
  className="w-full border border-slate-200 rounded-lg px-4 py-2"
  value={formData.categoryId}
  onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
>
  <option value="">-- प्रकार निवडा --</option>

  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
        </div>
        

        {/* Quantities Group */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">एकूण संख्या</label>
            <input 
              required
              type="number" 
              min="0"
              className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFormData({ ...formData, quantity: isNaN(val) ? 0 : val });
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">उपलब्ध</label>
            <input 
              required
              type="number" 
              min="0"
              className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.availableQuantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFormData({ ...formData, availableQuantity: isNaN(val) ? 0 : val });
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <button 
            type="button" 
            onClick={() => setIsModalOpen(false)}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
          >
            रद्द करा
          </button>
          <button 
            type="submit" 
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            {editingBook ? "बदल साठवा" : "नवीन नोंदणी करा"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
  }