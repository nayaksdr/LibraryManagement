import { useState } from "react";

const API = "https://localhost:44352/api";

interface Report {
  memberName: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}

export default function MonthlyReport() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!month || !year) {
      alert("Month आणि Year निवडा");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API}/member-attendance/monthly-report?month=${month}&year=${year}`
      );
      const result = await res.json();
      setData(result);
    } catch {
      alert("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row gap-3 justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📊 Monthly Report</h2>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Month (1-12)"
            onChange={e => setMonth(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <input
            type="number"
            placeholder="Year"
            onChange={e => setYear(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <button
            onClick={load}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Load
          </button>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-3 mb-4">
        <a
          href={`${API}/member-attendance-report/monthly-excel?month=${month}&year=${year}`}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📥 Excel
        </a>

        <a
          href={`${API}/member-attendance-report/monthly-pdf?month=${month}&year=${year}`}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          📄 PDF
        </a>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Member</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>

          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="p-3 font-medium">{d.memberName}</td>
                <td className="text-green-600 text-center">{d.present}</td>
                <td className="text-red-600 text-center">{d.absent}</td>
                <td className="text-yellow-600 text-center">{d.leave}</td>
                <td className="text-center">{d.total}</td>
                <td className="text-center font-bold">
                  {d.percentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="text-center mt-4">Loading...</p>}
    </div>
  );
}