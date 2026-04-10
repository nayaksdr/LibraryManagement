import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-lg">📚 ग्रंथालय व्यवस्थापन प्रणाली</h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        बाहेर पडा
      </button>
    </div>
  );
}